import { Hash } from '.'

describe('hash', () => {
  it('should statically take a string of any length and produce a hash value of 256 bits', () => {
    const message = 'dummy-data'
    const received = Hash.encode(message)
    const expected = 'a17424078f7e3eaaa894806cc5cc40e0f86a2635f93969f3e7d5df305413159f'
    expect(received).toEqual(expected)
  })

  it('should create', () => {
    const hash = new Hash()
    expect(hash).toBeTruthy()
  })

   it('should accept a hash', () => {
    const message = 'dummy-data'
    const expected = Hash.encode(message)
    const hash = new Hash()
    hash.hash = expected

    expect(hash.hash).toEqual(expected)

    hash.hash = undefined
    expect(hash.hash).not.toEqual(expected)

    hash.setHash(expected)
    expect(hash.hash).toEqual(expected)
  })

  it('should reject a non-hash by length', () => {
    const message = 'dummy-data'
    const hash = new Hash()
    const test = () => hash.hash = message

    expect(test).toThrow()
  })

  it('should encode a message', () => {
    const message = 'dummy-data'
    const hash = new Hash()
    hash.message = message
    const expected = 'a17424078f7e3eaaa894806cc5cc40e0f86a2635f93969f3e7d5df305413159f'

    expect(hash.hash).toEqual(expected)

    hash.setMessage(undefined)
    expect(hash.hash).not.toEqual(expected)

    hash.setMessage(message)
    expect(hash.hash).toEqual(expected)
  })
})