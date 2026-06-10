export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login') return

  const authStore = useAuthStore()
  await authStore.checkSession()

  if (!authStore.isLoggedIn) {
    return navigateTo('/login')
  }

  const role = authStore.currentUser?.role
  if (role !== 'admin' && role !== 'super_admin') {
    return navigateTo('/login')
  }
})

