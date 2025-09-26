import React from 'react';
import DependentForm from './DependentForm';

function DependentsList({ dependents, updateDependent, removeDependent }) {
  return (
    <>
      {dependents.map((dependent, index) => (
        <DependentForm
          key={index}
          index={index}
          dependent={dependent}
          updateDependent={updateDependent}
          removeDependent={removeDependent}
        />
      ))}
    </>
  );
}

export default DependentsList;
