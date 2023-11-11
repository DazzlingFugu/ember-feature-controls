import type RouterDSL from '@ember/routing/-private/router-dsl'

export default function (router: RouterDSL, options = { path: 'features' }) {
  router.route('features-list', options)
}
