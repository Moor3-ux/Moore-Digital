const SESSION_KEY = 'mds_authed'
const PASSWORD    = 'NinJA3154!'

export const checkPassword = (input) => input === PASSWORD
export const setAuthed     = ()      => sessionStorage.setItem(SESSION_KEY, '1')
export const clearAuth     = ()      => sessionStorage.removeItem(SESSION_KEY)
export const isAuthed      = ()      => sessionStorage.getItem(SESSION_KEY) === '1'
