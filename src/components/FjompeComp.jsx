import React, {useState} from 'react';

export const FjompeComp = ({setFjomp, fjomp}) => {
  return (
    <div>
      <button onClick={() => setFjomp('flesk')} >Flesk</button>
      <button onClick={() => setFjomp('flump')}>Flump</button>
      <h3 data-testid="fjompen">{fjomp}</h3>
    </div>
  );
};

export const FjompeParent = () => {
  const [fjomp, setFjomp] = useState('flesk');
  return <FjompeComp setFjomp={setFjomp} fjomp={fjomp}/>;
}
