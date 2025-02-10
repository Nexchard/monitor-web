import { createRouter, createWebHistory } from 'vue-router'
import ResourceList from '../views/ResourceList.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: ResourceList
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 