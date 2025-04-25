import ExampleAuthClient from "./ExampleAuthClient"
import type { User } from "@/types/user"

interface Props {
  user: User | null
  profile: any
}

export const metadata = {
  title: "Example Auth",
}

export default function ExampleAuth({ user, profile }: Props) {
  return <ExampleAuthClient user={user} profile={profile} />
}
