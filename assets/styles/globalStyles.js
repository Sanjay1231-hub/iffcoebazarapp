import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  // Container
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },

  // Pixel-safe TextInput style
  input: {
    fontSize: 15,
    lineHeight: 20,            // Pixel-safe
    minHeight: 40,             // Use minHeight instead of fixed height
    color: '#333',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
    textAlignVertical: 'center', // Vertical centering on Android
  },

  // Search Container
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 6,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: '#ccc',
    minHeight: 42, // Pixel-safe
  },

  searchIcon: {
    marginRight: 8,
  },

  // Headers
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    backgroundColor: '#6c80ad',
  },

  headerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#fff',
    paddingVertical: 3,
    borderRightWidth: 1,
    borderColor: '#fff',
    letterSpacing: 0.3,
  },

  // Table Row
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },

  cell: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },

  emptyMessage: {
    textAlign: 'center',
    paddingVertical: 20,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
});
