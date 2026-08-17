function withHook({ useHook, Component }) {
  const WrappedComponent = (props) => {
    const details = useHook(props);
    return <Component {...details} {...props} />;
  };

  return WrappedComponent;
}

export default withHook;