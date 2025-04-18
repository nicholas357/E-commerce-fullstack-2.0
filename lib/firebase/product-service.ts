import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "./config"

export const productService = {
  // Create a new product
  createProduct: async (productData) => {
    try {
      // Add timestamp
      const productWithTimestamp = {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "products"), productWithTimestamp)
      return { id: docRef.id, error: null }
    } catch (error) {
      return { id: null, error: error.message }
    }
  },

  // Update an existing product
  updateProduct: async (id, productData) => {
    try {
      const productRef = doc(db, "products", id)

      // Add updated timestamp
      const productWithTimestamp = {
        ...productData,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(productRef, productWithTimestamp)
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Delete a product
  deleteProduct: async (id) => {
    try {
      await deleteDoc(doc(db, "products", id))
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Get all products
  getAllProducts: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"))
      const products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      return { products, error: null }
    } catch (error) {
      return { products: [], error: error.message }
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const docRef = doc(db, "products", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const product = { id: docSnap.id, ...docSnap.data() }
        return { product, error: null }
      } else {
        return { product: null, error: "Product not found" }
      }
    } catch (error) {
      return { product: null, error: error.message }
    }
  },

  // Get products by category
  getProductsByCategory: async (category) => {
    try {
      const q = query(collection(db, "products"), where("category", "==", category), orderBy("createdAt", "desc"))

      const querySnapshot = await getDocs(q)
      const products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      return { products, error: null }
    } catch (error) {
      return { products: [], error: error.message }
    }
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    try {
      const q = query(
        collection(db, "products"),
        where("featured", "==", true),
        orderBy("createdAt", "desc"),
        limit(limit),
      )

      const querySnapshot = await getDocs(q)
      const products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      return { products, error: null }
    } catch (error) {
      return { products: [], error: error.message }
    }
  },

  // Upload product image
  uploadProductImage: async (file, productId) => {
    try {
      const storageRef = ref(storage, `products/${productId}/${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      return { url: downloadURL, error: null }
    } catch (error) {
      return { url: null, error: error.message }
    }
  },

  // Delete product image
  deleteProductImage: async (imageUrl) => {
    try {
      // Extract the path from the URL
      const imageRef = ref(storage, imageUrl)
      await deleteObject(imageRef)

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },
}
