import { combineReducers } from 'redux';
import authReducer from '../slices/authSlices';

const rootReducer  = combineReducers({
  auth:authReducer,

})

export default rootReducer