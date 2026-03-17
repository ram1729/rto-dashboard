import React from 'react';

const PolicyTag = ({ policy }) => {
  const styles = {
    'Hybrid': 'tag-hybrid',
    'Full Office': 'tag-office',
    'Remote-First': 'tag-remote',
    'Office-First': 'tag-office'
  };
  return <span className={`tag ${styles[policy] || 'tag-office'}`}>{policy}</span>;
};

export default PolicyTag;
