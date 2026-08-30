/**
 * authModel.js – Model layer for authentication forms.
 *
 * MVC Role: Model
 * Defines the initial state shapes for login and signup forms.
 */

/** Initial state for the Login form */
export const INITIAL_LOGIN_FORM = {
  username: '',
  password: '',
  remember: false,
  role: 'student',
}

/** Initial state for the Signup form */
export const INITIAL_SIGNUP_FORM = {
  fullName:        '',
  username:        '',
  email:           '',
  password:        '',
  confirmPassword: '',
}
