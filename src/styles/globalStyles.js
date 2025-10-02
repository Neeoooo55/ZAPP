import { StyleSheet } from 'react-native';
import colors from './colors';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  scrollContainer: {
    flexGrow: 1,
  },
  
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Text styles
  h1: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  
  h2: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  
  body: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  
  bodyLight: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 24,
  },
  
  small: {
    fontSize: 14,
    color: colors.textMuted,
  },
  
  // Button styles
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  buttonOutlineText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Card styles
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  // Input styles
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: colors.white,
    marginBottom: 16,
  },
  
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  
  // Spacing
  mt1: { marginTop: 8 },
  mt2: { marginTop: 16 },
  mt3: { marginTop: 24 },
  mt4: { marginTop: 32 },
  
  mb1: { marginBottom: 8 },
  mb2: { marginBottom: 16 },
  mb3: { marginBottom: 24 },
  mb4: { marginBottom: 32 },
  
  mx1: { marginHorizontal: 8 },
  mx2: { marginHorizontal: 16 },
  mx3: { marginHorizontal: 24 },
  
  my1: { marginVertical: 8 },
  my2: { marginVertical: 16 },
  my3: { marginVertical: 24 },
  
  p1: { padding: 8 },
  p2: { padding: 16 },
  p3: { padding: 24 },
  
  px1: { paddingHorizontal: 8 },
  px2: { paddingHorizontal: 16 },
  px3: { paddingHorizontal: 24 },
  
  py1: { paddingVertical: 8 },
  py2: { paddingVertical: 16 },
  py3: { paddingVertical: 24 },
});

export default globalStyles;

