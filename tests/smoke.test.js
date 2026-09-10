import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const index = fs.readFileSync('index.html', 'utf8');
const script = fs.readFileSync('script.js', 'utf8');
const style = fs.readFileSync('style.css', 'utf8');

const requiredIds = [
  'expense-form',
  'name',
  'amount',
  'transaction-type',
  'category',
  'transaction-date',
  'expense-list',
  'goal-input',
  'expenseChart',
  'trendChart'
];

test('dashboard contains required interactive elements', () => {
  for (const id of requiredIds) {
    assert.match(index, new RegExp(`id=["']${id}["']`), `Missing #${id}`);
  }
});

test('finance logic includes income, expense and balance calculations', () => {
  assert.match(script, /type === 'expense'/);
  assert.match(script, /type === 'income'/);
  assert.match(script, /balance: incomeTotal - expenseTotal/);
  assert.match(script, /average/);
});

test('analytics includes category and anomaly detection', () => {
  assert.match(script, /categoryTotals/);
  assert.match(script, /detectAnomalies/);
  assert.match(script, /standardDeviation/);
});

test('transactions are persisted with localStorage', () => {
  assert.match(script, /localStorage\.setItem\(storageKey/);
  assert.match(script, /JSON\.parse\(localStorage\.getItem\(storageKey\)/);
});

test('responsive styling is present', () => {
  assert.match(style, /@media/);
});
