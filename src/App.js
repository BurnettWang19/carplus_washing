import React, { useState } from 'react';
import { Car, Droplets, MapPin, CheckCircle, Plus, X, Eye, Pencil } from 'lucide-react';
import './App.css';

const App = () => {
  const [cars, setCars] = useState([
    {
      id: 1,
      plateNumber: 'ABC-1234',
      model: 'Toyota Camry',
      color: '白色',
      year: '2022',
      lastWash: '2025-08-08',
      status: 'all_cars',
      mileage: '25,000',
      lastReturn: '2025-08-09',
      nextRental: '2025-08-11'
    },
    {
      id: 2,
      plateNumber: 'XYZ-5678',
      model: 'Honda Civic',
      color: '銀色',
      year: '2023',
      lastWash: '2025-08-09',
      status: 'need_wash',
      mileage: '15,000',
      lastReturn: '2025-08-09',
      nextRental: '2025-08-12'
    },
    {
      id: 3,
      plateNumber: 'DEF-9876',
      model: 'Nissan Sentra',
      color: '黑色',
      year: '2021',
      lastWash: '2025-08-06',
      status: 'washed_ready',
      mileage: '35,000',
      lastReturn: '2025-08-08',
      nextRental: '2025-08-10'
    },
    {
      id: 4,
      plateNumber: 'GHI-1111',
      model: 'Mazda CX-5',
      color: '藍色',
      year: '2023',
      lastWash: '2025-08-10',
      status: 'in_dudu',
      mileage: '8,000',
      lastReturn: '2025-08-10',
      nextRental: '2025-08-13'
    },
    // 以下為 30 筆測試資料
    ...Array.from({ length: 30 }, (_, i) => ({
      id: 5 + i,
      plateNumber: `TST-${1000 + i}`,
      model: ['Toyota Yaris', 'Honda Fit', 'Nissan Kicks', 'Mazda 3', 'Ford Focus'][i % 5],
      color: ['白色', '黑色', '銀色', '藍色', '紅色'][i % 5],
      year: `${2020 + (i % 5)}`,
      lastWash: `2025-08-${(i % 28 + 1).toString().padStart(2, '0')}`,
      status: 'all_cars',
      mileage: `${(5000 + i * 1000).toLocaleString()}`,
      lastReturn: `2025-08-${(i % 28 + 1).toString().padStart(2, '0')}`,
      nextRental: `2025-08-${((i + 2) % 28 + 1).toString().padStart(2, '0')}`
    }))
  ]);

  const [draggedCar, setDraggedCar] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [newCar, setNewCar] = useState({
    plateNumber: '',
    model: '',
    color: '',
    year: '',
    mileage: '',
    isExternal: false // 新增
  });
  const [editingStatus, setEditingStatus] = useState(false);
  const [searchTerms, setSearchTerms] = useState({
    all_cars: '',
    need_wash: '',
    washed_ready: '',
    in_dudu: ''
  });
  const [expandedColumns, setExpandedColumns] = useState({
    all_cars: false,
    need_wash: false,
    washed_ready: false,
    in_dudu: false
  });

  const columns = [
    { id: 'all_cars', title: '所有車輛', icon: Car, className: 'column-gray' },
    { id: 'need_wash_shinkansen', title: '待洗放新幹線', icon: Droplets, className: 'column-blue' },
    { id: 'need_wash_dudu', title: '待洗進嘟嘟房', icon: Droplets, className: 'column-cyan' },
    { id: 'mazda3_need_wash', title: '馬三待洗', icon: Droplets, className: 'column-pink' },
    { id: 'washed_ready', title: '已洗好待進嘟嘟房', icon: CheckCircle, className: 'column-orange' },
    { id: 'in_dudu', title: '在嘟嘟房', icon: MapPin, className: 'column-green' }
  ];

  const handleDragStart = (e, car) => {
    setDraggedCar(car);
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    setDraggedCar(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedCar && draggedCar.status !== targetStatus) {
      setCars(cars.map(car => 
        car.id === draggedCar.id 
          ? { 
              ...car, 
              status: targetStatus,
              lastWash: (targetStatus === 'washed_ready' || targetStatus === 'in_dudu') 
                ? new Date().toISOString().split('T')[0] 
                : car.lastWash
            }
          : car
      ));
    }
  };

  const addCar = () => {
    if (newCar.plateNumber && newCar.model) {
      const car = {
        id: Date.now(),
        ...newCar,
        lastWash: '',
        status: 'all_cars',
        lastReturn: new Date().toISOString().split('T')[0],
        nextRental: ''
      };
      setCars([...cars, car]);
      setNewCar({ plateNumber: '', model: '', color: '', year: '', mileage: '', isExternal: false });
      setShowAddForm(false);
    }
  };

  const handleStatusChange = (carId, newStatus) => {
    setCars(cars.map(car =>
      car.id === carId
        ? {
            ...car,
            status: newStatus,
            lastWash: (newStatus === 'washed_ready' || newStatus === 'in_dudu')
              ? new Date().toISOString().split('T')[0]
              : car.lastWash
          }
        : car
    ));
    setSelectedCar(prev => prev ? { ...prev, status: newStatus } : prev);
  };

  const getCarsByStatus = (status) => {
    const term = (searchTerms[status] || '').trim();
    let filtered = cars.filter(car => car.status === status);
    if (term) {
      filtered = filtered
        .map(car => {
          const plateNum = car.plateNumber.replace(/\D/g, '');
          const matchIndex = plateNum.indexOf(term);
          return { car, matchIndex };
        })
        .filter(({ matchIndex }) => matchIndex !== -1)
        .sort((a, b) => a.matchIndex - b.matchIndex)
        .map(({ car }) => car)
        .concat(
          filtered.filter(car => car.plateNumber.replace(/\D/g, '').indexOf(term) === -1)
        );
    }
    return filtered;
  };

  const getDaysAgo = (dateString) => {
    if (!dateString) return 0;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'all_cars': return '所有車輛';
      case 'need_wash_shinkansen': return '待洗放新幹線';
      case 'need_wash_dudu': return '待洗進嘟嘟房';
      case 'mazda3_need_wash': return '馬三待洗';
      case 'washed_ready': return '已洗好待進嘟嘟房';
      case 'in_dudu': return '在嘟嘟房';
      default: return '未知狀態';
    }
  };

  const CarCard = ({ car }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, car)}
      onDragEnd={handleDragEnd}
      onClick={() => setSelectedCar(car)}
      className="car-card"
    >
      <div className="car-plate">{car.plateNumber}</div>
      <div className="car-model">{car.model}</div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedCar(car);
        }}
        className="car-detail-btn"
      >
        <Eye size={12} />
        詳細
      </button>
    </div>
  );

  return (
    <div className="container">
      {/* 標題區域 */}
      <div className="header">
        <div className="title">
          <h1>
            <Car className="title-icon" />
            租車洗車管理系統
          </h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            <Plus size={20} />
            新增車輛
          </button>
        </div>
      </div>

      {/* 四列看板 */}
      <div className="board">
        {columns.map(column => {
          const columnCars = getCarsByStatus(column.id);
          const IconComponent = column.icon;
          const searchTerm = searchTerms[column.id];
          const expanded = expandedColumns[column.id];

          // 只顯示前五台，除非展開
          const visibleCars = expanded ? columnCars : columnCars.slice(0, 5);

          return (
            <div key={column.id} className="column">
              <div className={`column-header ${column.className}`}>
                <h3>
                  <IconComponent size={20} />
                  {column.title}
                </h3>
                <span className="badge">{columnCars.length}</span>
              </div>
              {/* 搜尋框 */}
              <div style={{ padding: '8px 0' }}>
                <input
                  type="text"
                  placeholder="搜尋車牌數字"
                  value={searchTerm}
                  onChange={e => setSearchTerms({ ...searchTerms, [column.id]: e.target.value })}
                  className="search-input"
                  style={{ width: '100%', padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc' }}
                />
              </div>
              {/* 伸縮按鈕 */}
              <div style={{ textAlign: 'right', marginBottom: 8 }}>
                <button
                  className="btn btn-toggle"
                  onClick={() =>
                    setExpandedColumns({
                      ...expandedColumns,
                      [column.id]: !expandedColumns[column.id]
                    })
                  }
                >
                  {expanded ? '收合' : '顯示全部'}
                </button>
              </div>
              <div
                className={`column-content ${dragOverColumn === column.id ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {visibleCars.map(car => {
                  const plateNum = car.plateNumber.replace(/\D/g, '');
                  const isMatch = searchTerm && plateNum.includes(searchTerm.trim());
                  // 狀態對應底色 class
                  const statusColorClass = {
                    all_cars: 'car-card-gray',
                    need_wash_shinkansen: 'car-card-blue',
                    need_wash_dudu: 'car-card-cyan',
                    mazda3_need_wash: 'car-card-pink',
                    washed_ready: 'car-card-orange',
                    in_dudu: 'car-card-green'
                  }[car.status];

                  return (
                    <div
                      key={car.id}
                      className={`car-card ${statusColorClass}${isMatch ? ' highlight-card' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, car)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedCar(car)}
                      style={{ position: 'relative' }}
                    >
                      {car.isExternal && (
                        <div className="external-tag">
                          外站車
                        </div>
                      )}
                      <div className="car-plate">{car.plateNumber}</div>
                      <div className="car-model">{car.model}</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCar(car);
                        }}
                        className="car-detail-icon-btn"
                        title="查看詳細"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  );
                })}
                {columnCars.length === 0 && (
                  <div className="empty-column">
                    <IconComponent size={32} className="empty-icon" />
                    <p>拖拽車輛到這裡</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 車輛詳細資訊彈窗 */}
      {selectedCar && (
        <div className="modal" onClick={() => setSelectedCar(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <Car size={24} />
                車輛詳細資訊
              </h2>
              <button
                onClick={() => setSelectedCar(null)}
                className="close-btn"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="car-title">
                <div className="plate">{selectedCar.plateNumber}</div>
                <div className="model">{selectedCar.model}</div>
                <div className="color">{selectedCar.color || '未記錄'}</div>
              </div>

              <div className={`status-badge status-${selectedCar.status}`} style={{ marginTop: 16 }}>
                目前狀態: {getStatusText(selectedCar.status)}
              </div>

              <div className="status-change-btns" style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                {columns
                  .filter(col => col.id !== selectedCar.status)
                  .map(col => {
                    let btnClass = '';
                    if (col.id === 'need_wash') btnClass = 'btn-status-blue';
                    if (col.id === 'washed_ready') btnClass = 'btn-status-orange';
                    if (col.id === 'in_dudu') btnClass = 'btn-status-green';
                    return (
                      <button
                        key={col.id}
                        className={`btn btn-status ${btnClass}`}
                        style={{ flex: 1 }}
                        onClick={() => handleStatusChange(selectedCar.id, col.id)}
                      >
                        {col.title}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 新增車輛表單彈窗 */}
      {showAddForm && (
        <div className="modal" onClick={() => setShowAddForm(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={newCar.isExternal ? { background: '#ffe5e5' } : {}}
          >
            <div className="modal-header">
              <h2>新增車輛</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="close-btn"
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 12 }}>
                <label>
                  <input
                    type="radio"
                    name="isExternal"
                    checked={!newCar.isExternal}
                    onChange={() => setNewCar({ ...newCar, isExternal: false })}
                    style={{ marginRight: 4 }}
                  />
                  一般車
                </label>
                <label style={{ marginLeft: 16 }}>
                  <input
                    type="radio"
                    name="isExternal"
                    checked={newCar.isExternal}
                    onChange={() => setNewCar({ ...newCar, isExternal: true })}
                    style={{ marginRight: 4 }}
                  />
                  外站車
                </label>
              </div>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="車牌號碼*"
                  value={newCar.plateNumber}
                  onChange={(e) => setNewCar({...newCar, plateNumber: e.target.value})}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="車型*"
                  value={newCar.model}
                  onChange={(e) => setNewCar({...newCar, model: e.target.value})}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="顏色"
                  value={newCar.color}
                  onChange={(e) => setNewCar({...newCar, color: e.target.value})}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="年份"
                  value={newCar.year}
                  onChange={(e) => setNewCar({...newCar, year: e.target.value})}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="里程數"
                  value={newCar.mileage}
                  onChange={(e) => setNewCar({...newCar, mileage: e.target.value})}
                  className="form-input full-width"
                />
              </div>
              <div className="form-buttons">
                <button
                  onClick={addCar}
                  className="btn btn-success"
                >
                  確認新增
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-secondary"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;