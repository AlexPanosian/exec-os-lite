describe('Example Test Suite', () => {
  it('should pass this basic test', () => {
    expect(2 + 2).toBe(4)
  })

  it('should correctly compare strings', () => {
    const greeting = 'Hello, World!'
    expect(greeting).toBe('Hello, World!')
  })

  it('should verify truthy values', () => {
    expect(true).toBeTruthy()
    expect(1).toBeTruthy()
    expect('test').toBeTruthy()
  })
})