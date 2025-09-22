declare module '*?worker' {
  const workerConstructor: {
    new (): Worker;
    default: new () => Worker;
  };
  export default workerConstructor;
}

declare module '*?worker&inline' {
  const workerConstructor: {
    new (): Worker;
    default: new () => Worker;
  };
  export default workerConstructor;
}