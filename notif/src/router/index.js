import { createRouter, createWebHashHistory } from 'vue-router'
//import HomeView from '../views/HomeView.vue'
import Dashboard from '../views/Dashboard.vue'

const routes = [
  //{
   // path: '/',
    //name: 'home',
    //component: HomeView
  //},
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
