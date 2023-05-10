export async function benchmark<T>(
  createPromise: () => Promise<T>,
  startAfter: number,
  endAfter: number,
  precision = 10000 // roughly 2-30 ms delay
) {
  const promises: QueryPromise<T>[] = [];
  let oldFulfilled = 0;
  let newFulfilled = 0;
  let done = false;

  setTimeout(() => {
    void (() => {
      oldFulfilled = countFulfilled(promises);
    })();
  }, startAfter);

  setTimeout(() => {
    void (() => {
      newFulfilled = countFulfilled(promises);
      console.log(
        `${newFulfilled - oldFulfilled} promises done in ${
          endAfter - startAfter
        } ms`
      );
      done = true;
    })();
  }, endAfter);

  let iter = 0;
  while (!done) {
    promises.push(new QueryPromise(createPromise()));
    iter++;
    if (iter % precision === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
}

function countFulfilled<T>(promises: QueryPromise<T>[]) {
  const len = promises.length;
  let fulfilled = 0;
  for (let i = 0; i < len; i++) {
    const promise = promises[i];
    if (promise && promise.IsFulfilled()) {
      // if (promise && (await promiseState(promise)) === "fulfilled") {
      fulfilled++;
    }
  }
  return fulfilled;
}

class QueryPromise<T> {
  private isPending = true;
  private isRejected = false;
  private isFulfilled = false;

  constructor(promise: Promise<T>) {
    promise.then(
      (v) => {
        this.isFulfilled = true;
        this.isPending = false;
        return v;
      },
      (e) => {
        this.isRejected = true;
        this.isPending = false;
        throw e;
      }
    );
  }

  public IsResolved() {
    return !this.isPending;
  }

  public IsFulfilled() {
    return this.isFulfilled;
  }

  public IsRejected() {
    return this.isRejected;
  }
}
