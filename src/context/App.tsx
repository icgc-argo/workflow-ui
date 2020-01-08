import React, { useState } from "react";

type TAppContext = {
  DEV_disablePolling: boolean;
};

const defaultState = {
  DEV_disablePolling: process.env.NODE_ENV !== 'production'
}

export const AppContext = React.createContext<TAppContext>({
  DEV_disablePolling: defaultState.DEV_disablePolling
});

export const useInitialAppContextState = () => {
  const [DEV_disablePolling] = useState(defaultState.DEV_disablePolling);

  return {
    DEV_disablePolling
  };
};

export const useAppContext = () => {
  return React.useContext(AppContext);
};
