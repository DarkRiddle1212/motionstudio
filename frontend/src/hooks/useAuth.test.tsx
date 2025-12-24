import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { AuthProvider, useAuth } from './useAuth';
import { ReactNode } from 'react';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockedAxios.defaults = { headers: { common: {} } };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with no user when localStorage is empty', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('initializes with user data from localStorage', async () => {
    const mockUser = {
      id: '1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
      emailVerified: true,
    };
    const mockToken = 'mock-jwt-token';

    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user') return JSON.stringify(mockUser);
      if (key === 'token') return mockToken;
      return null;
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.isAuthenticated).toBe(true);
    expect(mockedAxios.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);
  });

  it('handles successful login', async () => {
    const mockResponse = {
      data: {
        user: {
          id: '1',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'student',
          emailVerified: true,
        },
        token: 'new-jwt-token',
      },
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.login('john@example.com', 'password123');
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:5000/api/auth/login',
      {
        email: 'john@example.com',
        password: 'password123',
      }
    );

    expect(result.current.user).toEqual(mockResponse.data.user);
    expect(result.current.token).toBe(mockResponse.data.token);
    expect(result.current.isAuthenticated).toBe(true);

    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-jwt-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.data.user));
    expect(mockedAxios.defaults.headers.common['Authorization']).toBe('Bearer new-jwt-token');
  });

  it('handles login errors', async () => {
    const mockError = {
      response: {
        data: {
          error: 'Invalid email or password',
        },
      },
    };

    mockedAxios.post.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.login('john@example.com', 'wrongpassword');
      })
    ).rejects.toThrow('Invalid email or password');

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('handles successful signup', async () => {
    const mockResponse = {
      data: {
        message: 'Account created successfully',
      },
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let signupResult;
    await act(async () => {
      signupResult = await result.current.signup('john@example.com', 'password123', 'John', 'Doe');
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:5000/api/auth/signup',
      {
        email: 'john@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      }
    );

    expect(signupResult).toEqual(mockResponse.data);
    // Signup doesn't automatically log in
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('handles signup errors', async () => {
    const mockError = {
      response: {
        data: {
          error: 'Email already registered',
        },
      },
    };

    mockedAxios.post.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.signup('john@example.com', 'password123');
      })
    ).rejects.toThrow('Email already registered');
  });

  it('handles successful email verification', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Email verified' } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.verifyEmail('verification-token');
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:5000/api/auth/verify-email',
      {
        token: 'verification-token',
      }
    );
  });

  it('handles email verification errors', async () => {
    const mockError = {
      response: {
        data: {
          error: 'Invalid or expired verification token',
        },
      },
    };

    mockedAxios.post.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.verifyEmail('invalid-token');
      })
    ).rejects.toThrow('Invalid or expired verification token');
  });

  it('handles logout correctly', async () => {
    // Set up initial authenticated state
    const mockUser = {
      id: '1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
      emailVerified: true,
    };
    const mockToken = 'mock-jwt-token';

    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user') return JSON.stringify(mockUser);
      if (key === 'token') return mockToken;
      return null;
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    expect(mockedAxios.defaults.headers.common['Authorization']).toBeUndefined();
  });

  it('throws error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });
});