import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useAuth } from '../providers/AuthProvider.js';

export default function IndexRoute() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) router.replace('/dashboard');
    else router.replace('/login');
  }, [router, user]);

  return React.createElement(View, { style: { flex: 1, alignItems: 'center', justifyContent: 'center' } }, React.createElement(Text, null, 'Loading'));
}
