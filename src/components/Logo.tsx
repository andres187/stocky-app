import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme/tokens';

export default function Logo() {
  return <Text style={styles.text}>Stocky</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Georgia',
    fontSize: 22,
    fontWeight: '600',
    color: colors.navy,
    letterSpacing: 0.5,
  },
});
