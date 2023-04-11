export class Repo {
  test() {
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        return () => {
          throw new Error(
            `Test code needs to be fixed - repo function ${String(
              prop
            )} should be mocked`
          );
        };
      },
    });
  }
}
