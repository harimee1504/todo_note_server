import NoteComments from './note-comments';
import NoteTags from './note-tags';
import Note from './notes';
import UserNoteAssignement from './user-note-assignments';
import UserNoteMentions from './user-note-mentions';

Note.hasMany(NoteComments, { 
    foreignKey: 'note_id', 
    as: 'noteComments' 
});

Note.hasMany(UserNoteAssignement, {
    foreignKey: 'note_id',
    as: 'attendees',
})

Note.hasMany(UserNoteMentions, {
    foreignKey: 'note_id',
    as: 'mentions',
})


Note.hasMany(NoteTags, {
    foreignKey: 'note_id',
    as: 'noteTags',
    onDelete: 'CASCADE',
})


export { Note };
