// import something here
import { can } from '../directives/can'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // something to do
  Vue.directive('can', can);
}
