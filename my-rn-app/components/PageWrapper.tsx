import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import ExplainButton from './ExplainButton';

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  const screenRef = useRef<View>(null);

  useEffect(() => {
    console.log('🔧 PageWrapper: Component mounted');
    console.log('📱 PageWrapper: screenRef initialized:', !!screenRef);
    
    // Add a small delay to ensure the view is fully rendered
    const timer = setTimeout(() => {
      console.log('📱 PageWrapper: screenRef.current after delay:', !!screenRef.current);
    }, 100);

    return () => {
      clearTimeout(timer);
      console.log('🔧 PageWrapper: Component unmounted');
    };
  }, []);

  return (
    <View 
      style={styles.container} 
      ref={screenRef}
      collapsable={false}
      renderToHardwareTextureAndroid={true}
    >
      {children}
      <ExplainButton screenRef={screenRef} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PageWrapper;
