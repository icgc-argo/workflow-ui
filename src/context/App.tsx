import React, { useState } from "react";

type TAppContext = {
  doesPoll: boolean;
  setPolling: (doesPoll: boolean) => void;
};

const defaultState = {
  doesPoll: false
}

export const AppContext = React.createContext<TAppContext>({
  doesPoll: defaultState.doesPoll,
  setPolling: doesPoll => doesPoll
});

export const useInitialAppContextState = () => {
  const [doesPoll, setPolling] = useState(defaultState.doesPoll);

  return {
    doesPoll,
    setPolling
  };
};

export const useAppContext = () => {
  return React.useContext(AppContext);
};
