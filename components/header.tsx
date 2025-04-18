"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, Search, ShoppingBag, ChevronDown, Menu, X, User, Home } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GamingButton } from "@/components/ui/gaming-button"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { UserProfileMenu } from "@/components/user-profile-menu"
import { useAuth } from "@/context/auth-context"
import { type Category, categoryService } from "@/lib/category-service"

export function Header() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [navbarCategories, setNavbarCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { totalItems } = useCart()
  const { totalItems: wishlistItems } = useWishlist()
  const { user } = useAuth()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const allCategories = await categoryService.getCategories()
        setCategories(allCategories)

        // Filter categories that should be shown in navbar
        const navbarCats = allCategories.filter((cat) => cat.show_in_navbar && cat.is_active && !cat.parent_id)
        setNavbarCategories(navbarCats)
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleDropdownToggle = (title: string) => {
    setActiveDropdown(activeDropdown === title ? null : title)
  }

  // When mobile menu is open, prevent body scrolling
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  // Get subcategories for a parent category
  const getSubcategories = (parentId: string) => {
    return categories.filter((cat) => cat.parent_id === parentId && cat.is_active)
  }

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/95 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]" : "bg-background"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <div className="flex items-center">
            <Link
              href="/"
              className="mr-4 text-2xl font-bold text-white transition-colors hover:text-amber-400 hover:glow-text-amber"
              aria-label="Go to homepage"
            >
              <span className="glow-text-amber">turgame</span>
            </Link>

            {/* Mobile menu button - moved to the left side */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/50 text-white md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <Select defaultValue="en">
              <SelectTrigger className="w-[100px] border-border bg-muted/50 text-white">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-white">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="tr">Turkish</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="npr">
              <SelectTrigger className="w-[80px] border-border bg-muted/50 text-white">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-white">
                <SelectItem value="npr">NPR</SelectItem>
                <SelectItem value="usd">USD</SelectItem>
                <SelectItem value="eur">EUR</SelectItem>
                <SelectItem value="try">TRY</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-2">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:flex-1 md:items-center md:justify-center md:space-x-6">
            <Link
              href="/"
              className="flex items-center font-bold text-white transition-colors hover:text-amber-400 hover:glow-text-amber"
            >
              <Home className="mr-1 h-4 w-4" />
              Home
            </Link>
            {loading
              ? // Show loading placeholders
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-6 w-24 animate-pulse rounded-md bg-muted/30"></div>
                ))
              : // Show actual categories
                navbarCategories.map((category) => (
                  <div
                    key={category.id}
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(category.id)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link
                      href={`/category/${category.slug}`}
                      className="flex items-center font-bold text-white transition-colors hover:text-amber-400 hover:glow-text-amber"
                      onClick={(e) => {
                        if (getSubcategories(category.id).length > 0) {
                          e.preventDefault()
                          handleDropdownToggle(category.id)
                        }
                      }}
                    >
                      {category.name}
                      {getSubcategories(category.id).length > 0 && <ChevronDown className="ml-1 h-4 w-4" />}
                    </Link>
                    {activeDropdown === category.id && getSubcategories(category.id).length > 0 && (
                      <div className="absolute left-0 mt-2 w-48 rounded-md border border-border bg-card py-2 shadow-lg shadow-black/50">
                        <Link
                          href={`/category/${category.slug}`}
                          className="block px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500/10 hover:text-amber-400 hover:glow-text-amber"
                        >
                          All {category.name}
                        </Link>
                        <div className="my-1 border-t border-border/50"></div>
                        {getSubcategories(category.id).map((subCategory) => (
                          <Link
                            key={subCategory.id}
                            href={`/category/${category.slug}/${subCategory.slug}`}
                            className="block px-4 py-2 text-sm text-white transition-colors hover:bg-amber-500/10 hover:text-amber-400 hover:glow-text-amber"
                          >
                            {subCategory.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/50 text-white transition-colors hover:border-amber-500 hover:text-amber-400"
            >
              <Search className="h-5 w-5" />
            </Link>
            <UserProfileMenu />
            <Link
              href="/wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/50 text-white transition-colors hover:border-amber-500 hover:text-amber-400"
            >
              <Heart className="h-5 w-5" />
              {wishlistItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black">
                  {wishlistItems}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/50 text-white transition-colors hover:border-amber-500 hover:text-amber-400"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Navigation - Simplified and more user-friendly */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md" style={{ paddingTop: "105px" }}>
          {/* Close button at the top */}
          <div className="absolute right-4 top-4 z-10">
            <GamingButton
              variant="amber"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Close Menu
            </GamingButton>
          </div>

          <nav className="relative z-10 flex h-full flex-col overflow-y-auto p-6 pt-16">
            {/* Main navigation categories */}
            <div className="mb-8">
              <h3 className="mb-4 text-sm font-semibold uppercase text-amber-400">Main Menu</h3>
              <div className="mb-3">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center rounded-md border border-border bg-card/50 p-3 font-medium text-white transition-colors hover:border-amber-500/50 hover:bg-card"
                >
                  <Home className="mr-2 h-5 w-5 text-amber-400" />
                  <span>Home</span>
                </Link>
              </div>
              {loading
                ? // Loading placeholders for mobile menu
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="h-12 w-full animate-pulse rounded-md bg-muted/30"></div>
                    </div>
                  ))
                : // Actual categories for mobile menu
                  navbarCategories.map((category) => (
                    <div key={category.id} className="mb-3">
                      <button
                        onClick={() => handleDropdownToggle(category.id)}
                        className="flex w-full items-center justify-between rounded-md border border-border bg-card/50 p-3 font-medium text-white transition-colors hover:border-amber-500/50 hover:bg-card"
                      >
                        <span>{category.name}</span>
                        <ChevronDown
                          className={`h-5 w-5 text-amber-400 transition-transform ${
                            activeDropdown === category.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {activeDropdown === category.id && (
                        <div className="overflow-hidden">
                          <div className="mt-1 rounded-md border border-border/50 bg-card/30 p-1">
                            <Link
                              href={`/category/${category.slug}`}
                              className="block rounded-sm px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500/10 hover:text-amber-400"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              All {category.name}
                            </Link>
                            <div className="my-1 border-t border-border/50"></div>
                            {getSubcategories(category.id).map((subCategory) => (
                              <div key={subCategory.id}>
                                <Link
                                  href={`/category/${category.slug}/${subCategory.slug}`}
                                  className="block rounded-sm px-4 py-2 text-sm text-white transition-colors hover:bg-amber-500/10 hover:text-amber-400"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {subCategory.name}
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
            </div>

            {/* Quick links */}
            <div className="mb-8">
              <h3 className="mb-4 text-sm font-semibold uppercase text-amber-400">Quick Links</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={user ? "/account" : "/account/login"}
                  className="flex items-center rounded-md border border-border bg-card/50 p-3 text-white transition-colors hover:border-amber-500/50 hover:bg-card"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="mr-2 h-5 w-5 text-amber-400" />
                  <span>{user ? "Account" : "Login"}</span>
                </Link>
                <Link
                  href="/wishlist"
                  className="flex items-center rounded-md border border-border bg-card/50 p-3 text-white transition-colors hover:border-amber-500/50 hover:bg-card"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="mr-2 h-5 w-5 text-amber-400" />
                  <span>Wishlist {wishlistItems > 0 && `(${wishlistItems})`}</span>
                </Link>
                <Link
                  href="/search"
                  className="flex items-center rounded-md border border-border bg-card/50 p-3 text-white transition-colors hover:border-amber-500/50 hover:bg-card"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Search className="mr-2 h-5 w-5 text-amber-400" />
                  <span>Search</span>
                </Link>
                <Link
                  href="/cart"
                  className="flex items-center rounded-md border border-border bg-card/50 p-3 text-white transition-colors hover:border-amber-500/50 hover:bg-card"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingBag className="mr-2 h-5 w-5 text-amber-400" />
                  <span>Cart {totalItems > 0 && `(${totalItems})`}</span>
                </Link>
              </div>
            </div>

            {/* Settings */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase text-amber-400">Settings</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-border bg-card/50 p-3">
                  <p className="mb-2 text-sm text-white">Language</p>
                  <Select defaultValue="en">
                    <SelectTrigger className="w-full border-border bg-card/80 text-white">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card text-white">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="tr">Turkish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-md border border-border bg-card/50 p-3">
                  <p className="mb-2 text-sm text-white">Currency</p>
                  <Select defaultValue="npr">
                    <SelectTrigger className="w-full border-border bg-card/80 text-white">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card text-white">
                      <SelectItem value="npr">NPR</SelectItem>
                      <SelectItem value="usd">USD</SelectItem>
                      <SelectItem value="eur">EUR</SelectItem>
                      <SelectItem value="try">TRY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Close button at the bottom */}
            <div className="mt-8 flex justify-center">
              <GamingButton variant="amber" onClick={() => setMobileMenuOpen(false)} className="w-full">
                Close Menu
              </GamingButton>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
