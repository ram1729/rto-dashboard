import React, { useState } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const CompanyTable = ({ data }) => {
  const [sortField, setSortField] = useState('company');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const rowsPerPage = 20; // Adjusted rows per page to fill space

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    
    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  const currentData = sortedData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const StatusText = ({ policy }) => {
    let typeClass = '';
    if (policy === 'Remote-First') typeClass = 'status-remote';
    else if (policy === 'Hybrid') typeClass = 'status-hybrid';
    else if (policy === 'Office-First') typeClass = 'status-office';
    else if (policy === 'Full Office') typeClass = 'status-full';
    
    return (
      <span className={typeClass}>
        {policy}
      </span>
    );
  };

  const Th = ({ label, field }) => (
    <th 
      className="table-th"
      onClick={() => handleSort(field)}
    >
      <div className="th-content">
        {label}
        {sortField === field && <ArrowUpDown size={14} className="sort-icon" />}
      </div>
    </th>
  );

  return (
    <div className="table-panel">
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <Th label="Company" field="company" />
              <Th label="Sector" field="sector" />
              <Th label="Policy" field="policy" />
              <Th label="Days in Office" field="daysInOffice" />
              <Th label="Last Updated" field="lastUpdate" />
              <Th label="Source" field="source" />
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan="6" className="td-secondary" style={{textAlign: 'center', padding: '2rem'}}>
                  No companies found matching the current filters.
                </td>
              </tr>
            ) : (
              currentData.map((row) => (
                <tr key={row.id} className="table-row">
                  <td className="td-strong">{row.company}</td>
                  <td className="td-secondary">{row.sector}</td>
                  <td><StatusText policy={row.policy} /></td>
                  <td className="td-strong">
                    {row.daysInOffice > 0 ? row.daysInOffice : <span className="td-secondary">-</span>}
                  </td>
                  <td className="td-secondary">{row.lastUpdate}</td>
                  <td>
                    {row.source ? (
                      <a href={row.source} target="_blank" rel="noopener noreferrer" className="text-accent inline-flex items-center gap-1">
                        View <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="td-secondary">Unknown</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <span className="td-secondary text-medium" style={{fontSize: '0.875rem'}}>
          Showing <span className="td-strong">{(page - 1) * rowsPerPage + 1}</span> to <span className="td-strong">{Math.min(page * rowsPerPage, sortedData.length)}</span> of <span className="td-strong">{sortedData.length}</span> entries
        </span>
        <div className="pagination-controls">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="btn-primary"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <button 
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="btn-primary"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyTable;
