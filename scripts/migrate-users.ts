import { createClient } from "@supabase/supabase-js"
import * as admin from "firebase-admin"
import * as fs from "fs"

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

// Initialize Supabase Admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
)

async function exportSupabaseUsers() {
  console.log("Exporting users from Supabase...")

  // Get all users from Supabase Auth
  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()

  if (error) {
    console.error("Error fetching Supabase users:", error)
    return null
  }

  console.log(`Found ${users.users.length} users in Supabase`)

  // Get all profiles from Supabase
  const { data: profiles, error: profilesError } = await supabaseAdmin.from("profiles").select("*")

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError)
    return null
  }

  // Create a map of user IDs to profiles
  const profileMap = new Map()
  profiles.forEach((profile) => {
    profileMap.set(profile.id, profile)
  })

  // Combine user data with profile data
  const combinedUsers = users.users.map((user) => {
    const profile = profileMap.get(user.id) || {}
    return {
      id: user.id,
      email: user.email,
      email_verified: user.email_confirmed_at ? true : false,
      password_hash: user.encrypted_password,
      full_name: profile.full_name || "",
      avatar_url: profile.avatar_url || "",
      role: profile.role || "user",
      created_at: user.created_at,
    }
  })

  // Save to a JSON file for backup
  fs.writeFileSync("./supabase-users.json", JSON.stringify(combinedUsers, null, 2))

  return combinedUsers
}

async function importUsersToFirebase(users) {
  console.log("Importing users to Firebase...")

  const results = {
    success: 0,
    failed: 0,
    errors: [],
  }

  for (const user of users) {
    try {
      // Check if user already exists in Firebase
      try {
        const existingUser = await admin.auth().getUserByEmail(user.email)
        console.log(`User ${user.email} already exists in Firebase with UID: ${existingUser.uid}`)

        // Update the Supabase profile with the Firebase UID
        await updateSupabaseProfile(user.id, existingUser.uid)

        results.success++
        continue
      } catch (error) {
        // User doesn't exist, proceed with creation
      }

      // Create user in Firebase
      const userRecord = await admin.auth().createUser({
        email: user.email,
        emailVerified: user.email_verified,
        // Note: We can't directly import password hashes as they use different algorithms
        // Users will need to reset their passwords
        displayName: user.full_name,
        photoURL: user.avatar_url,
        disabled: false,
      })

      // Set custom claims for role
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        role: user.role,
      })

      console.log(`Created Firebase user with UID: ${userRecord.uid}`)

      // Update the Supabase profile with the Firebase UID
      await updateSupabaseProfile(user.id, userRecord.uid)

      results.success++
    } catch (error) {
      console.error(`Failed to import user ${user.email}:`, error)
      results.failed++
      results.errors.push({
        email: user.email,
        error: error.message,
      })
    }
  }

  console.log(`Import complete. Success: ${results.success}, Failed: ${results.failed}`)

  // Save errors to a file for review
  if (results.errors.length > 0) {
    fs.writeFileSync("./import-errors.json", JSON.stringify(results.errors, null, 2))
  }

  return results
}

async function updateSupabaseProfile(supabaseId, firebaseUid) {
  // Update the profile in Supabase with the Firebase UID
  const { error } = await supabaseAdmin.from("profiles").update({ firebase_uid: firebaseUid }).eq("id", supabaseId)

  if (error) {
    console.error(`Error updating profile for user ${supabaseId}:`, error)
    throw error
  }

  console.log(`Updated Supabase profile for user ${supabaseId} with Firebase UID ${firebaseUid}`)
}

async function runMigration() {
  try {
    // First, add the firebase_uid column to the profiles table if it doesn't exist
    await addFirebaseUidColumn()

    // Export users from Supabase
    const users = await exportSupabaseUsers()

    if (!users) {
      console.error("Failed to export users from Supabase")
      return
    }

    // Import users to Firebase
    await importUsersToFirebase(users)

    console.log("Migration completed successfully")
  } catch (error) {
    console.error("Migration failed:", error)
  }
}

async function addFirebaseUidColumn() {
  // Check if the firebase_uid column exists
  const { data, error } = await supabaseAdmin.rpc("check_column_exists", {
    table_name: "profiles",
    column_name: "firebase_uid",
  })

  if (error) {
    console.error("Error checking for firebase_uid column:", error)
    throw error
  }

  // If the column doesn't exist, add it
  if (!data) {
    console.log("Adding firebase_uid column to profiles table...")

    // Execute SQL to add the column
    const { error: alterError } = await supabaseAdmin.rpc("execute_sql", {
      sql: "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS firebase_uid TEXT UNIQUE",
    })

    if (alterError) {
      console.error("Error adding firebase_uid column:", alterError)
      throw alterError
    }

    console.log("Added firebase_uid column to profiles table")
  } else {
    console.log("firebase_uid column already exists in profiles table")
  }
}

// Run the migration
runMigration()
