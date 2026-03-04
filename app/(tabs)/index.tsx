import { View, StyleSheet } from 'react-native';
import BeachMap from '../../src/components/BeachMap';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <BeachMap />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
