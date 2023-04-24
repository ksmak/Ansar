import instance from './instance'
import ansarClientModule from './ansarClient'

// eslint-disable-next-line
export default {
    ansarClient: ansarClientModule(instance), 
}