import {render, screen} from '@testing-library/react';
import App from './App';
import {localStorageMock} from "./LocalStorageMock";

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Test App", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  test('handles blank slate', () => {
    render(<App />)
    const button = screen.getByText(/Add City/i)
    expect(button).toBeInTheDocument()
  });
  test('handles city with nothing set up', () => {
    localStorageMock.setItem('simSettings', JSON.stringify({cities: {testing: {}}}))
    render(<App />)
    const settingsButton = screen.getByText(/Settings/i)
    expect(settingsButton).toBeInTheDocument()
  });

})
