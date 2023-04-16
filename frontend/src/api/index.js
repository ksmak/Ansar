import instance from './instance'
import ansarClientModule from './ansarClient'

export default {
    ansarClient: ansarClientModule(instance), 
}