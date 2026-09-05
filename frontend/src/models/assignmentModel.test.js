import { test } from 'node:test'
import assert from 'node:assert/strict'
import { matchesAssignmentSearch, submissionPreviewKind } from './assignmentModel.js'

test('search matches words across fields, ignoring case and extra spaces', () => {
  assert.equal(matchesAssignmentSearch('  cse220 tree ', 'CSE220', 'Binary Tree'), true)
  assert.equal(matchesAssignmentSearch('cse220 graph', 'CSE220', 'Binary Tree'), false)
  assert.equal(matchesAssignmentSearch('', null, 'Assignment'), true)
})

test('preview types support common submissions without embedding active markup', () => {
  for (const [name, type] of [['work.PDF', 'pdf'], ['photo.png', 'image'], ['main.py', 'text'], ['work.docx', 'document'], ['work.zip', 'document'], ['page.html', 'text'], ['image.svg', 'text'], ['app.exe', 'unsupported']]) {
    assert.equal(submissionPreviewKind(name), type)
  }
})
