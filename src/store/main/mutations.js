/*
export const someMutation = (state) => {}
 */
export const setUser = (state, userData) => {
  state.user = userData;
};
export const changeRefreshState = (state, refresh) => {
  state.refreshState = refresh;
};
export const controlModal = (state, open) => {
  state.openModal = open;
};
export const setDisableInput = (state, display) => {
  state.disableInput = display;
};
export const setDisableTimePicker = (state, date) => {
  state.disableTimePicker = date;
};
export const toggleFilter = (state, toggle) => {
  state.showFilter = toggle;
};
export const setOgustUser = (state, ogustUserData) => {
  state.ogustUser = ogustUserData;
};
export const setAuxiliariesChosen = (state, auxiliaries) => {
  state.auxiliariesChosen = auxiliaries;
};
export const getOgustToken = (state, token) => {
  state.ogustToken = token;
};
export const setToggleDrawer = (state, toggle) => {
  state.toggleDrawer = toggle;
};
