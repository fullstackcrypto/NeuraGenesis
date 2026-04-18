import React from 'react';
import { Slot } from 'expo-router';
import { AuthProvider } from '../providers/AuthProvider.js';

export default function RootLayout() {
  return React.createElement(AuthProvider, null, React.createElement(Slot, null));
}
