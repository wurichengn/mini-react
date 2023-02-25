
export const createContext = () => {
  return {
    Provider: (props) => props.children
  };
};
