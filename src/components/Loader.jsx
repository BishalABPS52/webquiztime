import React from 'react';
import styles from './Loader.module.css';

const Loader = () => {
  return (
    <div>
      <div className={styles.loadingspinner}>
        <div id="square1" />
        <div id="square2" />
        <div id="square3" />
        <div id="square4" />
        <div id="square5" />
      </div>
    </div>
  );
};

export default Loader;