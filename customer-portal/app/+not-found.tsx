import { Redirect, Stack } from 'expo-router';

// Redirect any unmatched path (e.g. /customer-portal/ base path) to home screen
export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Redirecting…' }} />
      <Redirect href="/" />
    </>
  );
}
