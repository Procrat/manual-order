class TupleMap<K, V> {
  map: Map<K, Map<K, V>>;

  constructor() {
    this.map = new Map();
  }

  set(key: [K, K], value: V): void {
    const innerMap = this.map.get(key[0]);
    if (innerMap === undefined) {
      this.map.set(key[0], new Map([[key[1], value]]));
    } else {
      innerMap.set(key[1], value);
    }
  }

  get(key: [K, K]): V | undefined {
    return this.map.get(key[0])?.get(key[1]);
  }
}

export default TupleMap;
