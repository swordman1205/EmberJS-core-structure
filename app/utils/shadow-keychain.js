export default class ShadowKeychain {
  constructor(attributes) {
    this.attributes = attributes;
  }

  get(attribute) {
    return this.attributes[attribute];
  }
}
