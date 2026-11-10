import React, { useEffect, useState } from 'react';
import { Download, RotateCcw, RotateCw, Trash2 } from 'lucide-react';

const columns = 8;
const rows = 6;
const storageKey = 'baosat-layout-v1';
const roomTypes = {
  living: { name: 'Living', width: 3, height: 2, color: '#e6cba2' },
  kitchen: { name: 'Kitchen', width: 2, height: 2, color: '#c9d3b8' },
  bedroom: { name: 'Bedroom', width: 2, height: 2, color: '#d7c8df' },
  bath: { name: 'Bath', width: 2, height: 1, color: '#c8d9df' },
  terrace: { name: 'Terrace', width: 3, height: 2, color: '#e4d9b6' },
};
const sample = [
  { id: 'sample-living', type: 'living', x: 0, y: 0, width: 3, height: 2 },
  { id: 'sample-kitchen', type: 'kitchen', x: 3, y: 0, width: 2, height: 2 },
  { id: 'sample-bedroom', type: 'bedroom', x: 0, y: 3, width: 2, height: 2 },
  { id: 'sample-bath', type: 'bath', x: 2, y: 3, width: 2, height: 1 },
  { id: 'sample-terrace', type: 'terrace', x: 5, y: 0, width: 3, height: 2 },
];

function fits(room, rooms) {
  return room.x >= 0 && room.y >= 0 && room.x + room.width <= columns && room.y + room.height <= rows &&
    rooms.every(other => other.id === room.id ||
      room.x + room.width <= other.x || other.x + other.width <= room.x ||
      room.y + room.height <= other.y || other.y + other.height <= room.y);
}

function loadRooms() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    if (!Array.isArray(stored) || stored.length > columns * rows) return [];
    const rooms = [];
    for (const room of stored) {
      const type = room && Object.hasOwn(roomTypes, room.type) && roomTypes[room.type];
      if (!type || typeof room.id !== 'string' || rooms.some(other => other.id === room.id) ||
          !Number.isInteger(room.x) || !Number.isInteger(room.y) ||
          !((room.width === type.width && room.height === type.height) ||
            (room.width === type.height && room.height === type.width)) || !fits(room, rooms)) return [];
      rooms.push(room);
    }
    return rooms;
  } catch {
    return [];
  }
}

function downloadPlan(rooms) {
  const unit = 70;
  const width = columns * unit;
  const height = rows * unit;
  const spaces = rooms.map(room => {
    const { color, name } = roomTypes[room.type];
    const x = room.x * unit;
    const y = room.y * unit;
    return `<rect x="${x + 2}" y="${y + 2}" width="${room.width * unit - 4}" height="${room.height * unit - 4}" rx="6" fill="${color}" stroke="#39463a"/><text x="${x + room.width * unit / 2}" y="${y + room.height * unit / 2}" dominant-baseline="middle" text-anchor="middle" font-size="14">${name}</text>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width + 48}" height="${height + 116}" viewBox="0 0 ${width + 48} ${height + 116}" font-family="system-ui,sans-serif" fill="#222b23"><defs><pattern id="grid" width="${unit}" height="${unit}" patternUnits="userSpaceOnUse"><path d="M ${unit} 0 H 0 V ${unit}" fill="none" stroke="#c6c6ba"/></pattern></defs><rect width="100%" height="100%" fill="#f7f5ee"/><text x="24" y="36" font-size="22">BAOSAT Housing • Layout concept</text><g transform="translate(24 58)"><rect width="${width}" height="${height}" fill="url(#grid)" stroke="#c6c6ba"/>${spaces}</g><text x="24" y="${height + 91}" font-size="13">Concept sketch • Grid units are illustrative</text></svg>`;
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'baosat-layout-concept.svg';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function LayoutStudio() {
  const [rooms, setRooms] = useState(loadRooms);
  const [previous, setPrevious] = useState(null);
  const [tool, setTool] = useState('living');
  const [selectedId, setSelectedId] = useState(null);
  const [cell, setCell] = useState(0);
  const [notice, setNotice] = useState('');
  const [saved, setSaved] = useState(true);
  const selected = rooms.find(room => room.id === selectedId);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(rooms));
    } catch {
      setSaved(false);
    }
  }, [rooms]);

  function update(next, message) {
    setPrevious(rooms);
    setRooms(next);
    setNotice(message);
  }

  function activate(x, y, occupant) {
    if (occupant) {
      setSelectedId(occupant.id === selectedId ? null : occupant.id);
      setNotice(occupant.id === selectedId ? 'Room deselected.' : `${roomTypes[occupant.type].name} selected. Choose an empty cell to move it.`);
      return;
    }

    const type = roomTypes[tool];
    const room = selected
      ? { ...selected, x, y }
      : { id: Array.from({ length: rooms.length + 1 }, (_, index) => String(index)).find(id => rooms.every(room => room.id !== id)), type: tool, x, y, width: type.width, height: type.height };
    if (!fits(room, rooms)) {
      setNotice('That room would overlap another room or extend beyond the grid.');
      return;
    }
    const next = selected ? rooms.map(item => item.id === room.id ? room : item) : [...rooms, room];
    update(next, `${roomTypes[room.type].name} ${selected ? 'moved' : 'added'}.`);
  }

  function rotate() {
    const rotated = { ...selected, width: selected.height, height: selected.width };
    if (!fits(rotated, rooms)) {
      setNotice('There is not enough space to rotate this room.');
      return;
    }
    update(rooms.map(room => room.id === rotated.id ? rotated : room), 'Room rotated.');
  }

  function moveFocus(event, index) {
    const x = index % columns;
    const y = Math.floor(index / columns);
    const destinations = {
      ArrowLeft: x > 0 ? index - 1 : index,
      ArrowRight: x < columns - 1 ? index + 1 : index,
      ArrowUp: y > 0 ? index - columns : index,
      ArrowDown: y < rows - 1 ? index + columns : index,
    };
    if (!Object.hasOwn(destinations, event.key)) return;
    event.preventDefault();
    event.currentTarget.parentElement.children[destinations[event.key]].focus();
  }

  return <section className="studio wrap" id="studio" aria-labelledby="studio-title">
    <div className="section-intro">
      <div><p className="eyebrow"><span /> 03 / BAOSAT LAYOUT STUDIO</p><h2 id="studio-title">Sketch a home that fits.</h2></div>
      <p>Arrange the rooms you want, try a few configurations, and download a concept you can share with a designer.</p>
    </div>
    <div className="studio-panel">
      <div className="studio-tools">
        <h3>Choose a room</h3>
        <p>Pick a room and tap an empty cell to place it. Select a placed room to move, rotate, or remove it.</p>
        <div className="studio-palette" role="group" aria-label="Room types">
          {Object.entries(roomTypes).map(([key, type]) => <button type="button" key={key} aria-pressed={!selected && tool === key} onClick={() => {
            setTool(key);
            setSelectedId(null);
            setNotice(`${type.name} ready to place.`);
          }}><span style={{ background: type.color }} aria-hidden="true"/>{type.name}<small>{type.width} × {type.height}</small></button>)}
        </div>
        {selected && <div className="studio-edit" role="group" aria-label="Selected room controls">
          <button type="button" onClick={rotate}><RotateCw size={15}/> Rotate</button>
          <button type="button" onClick={() => {
            update(rooms.filter(room => room.id !== selectedId), 'Room removed.');
            setSelectedId(null);
          }}><Trash2 size={15}/> Remove</button>
        </div>}
      </div>
      <div className="studio-workspace">
        <div className="studio-board-heading"><strong>Concept plan</strong><span>{rooms.length} {rooms.length === 1 ? 'room' : 'rooms'}</span></div>
        <div className="studio-grid" role="group" aria-label="Layout grid. Use arrow keys to move between cells.">
          {Array.from({ length: columns * rows }, (_, index) => {
            const x = index % columns;
            const y = Math.floor(index / columns);
            const occupant = rooms.find(room => x >= room.x && x < room.x + room.width && y >= room.y && y < room.y + room.height);
            return <button className="studio-cell" key={index} type="button" tabIndex={cell === index ? 0 : -1} style={{ gridColumn: x + 1, gridRow: y + 1 }}
              aria-label={`Row ${y + 1}, column ${x + 1}: ${occupant ? roomTypes[occupant.type].name : 'empty'}`}
              onFocus={() => setCell(index)} onKeyDown={event => moveFocus(event, index)} onClick={() => activate(x, y, occupant)} />;
          })}
          {rooms.map(room => <div key={room.id} className={`studio-room${room.id === selectedId ? ' selected' : ''}`}
            aria-hidden="true" style={{ gridColumn: `${room.x + 1} / span ${room.width}`, gridRow: `${room.y + 1} / span ${room.height}`, background: roomTypes[room.type].color }}>
            {roomTypes[room.type].name}
          </div>)}
        </div>
        <p className="studio-status" role="status">{notice || (saved ? 'Your changes are saved in this browser.' : 'Browser storage is unavailable. Download your plan to keep it.')}</p>
        <div className="studio-actions">
          <button type="button" disabled={rooms.length > 0} onClick={() => update(sample, 'Example layout loaded.')}>Try an example</button>
          <button type="button" disabled={!previous} onClick={() => {
            setRooms(previous);
            setPrevious(null);
            setSelectedId(null);
            setNotice('Last change undone.');
          }}><RotateCcw size={15}/> Undo</button>
          <button type="button" disabled={!rooms.length} onClick={() => {
            update([], 'Layout cleared. Undo to restore it.');
            setSelectedId(null);
          }}>Clear</button>
          <button className="studio-download" type="button" disabled={!rooms.length} onClick={() => downloadPlan(rooms)}><Download size={16}/> Download plan</button>
        </div>
      </div>
    </div>
    <p className="studio-note">For early design conversations. Grid units are illustrative.</p>
  </section>;
}
