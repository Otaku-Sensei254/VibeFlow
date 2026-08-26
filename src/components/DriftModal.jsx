import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smile, Reply, Loader, Heart, MessageCircle, Trash2 } from 'lucide-react';
import api from '../utils/api';

const DriftModal = ({ drift, isOpen, onClose, onReact, onReply, onDelete, onEdit, currentUser }) => {
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [reactions, setReactions] = useState(drift?.reactions || []);
  const [interactions, setInteractions] = useState(drift?.interactions || []);

  // Standard emoji list for quick reactions
  const standardEmojis = ['🔥', '😎', '😆', '💀', '❤️', '😂', '🎉', '🙏', '💯', '⚡️', '🌟', '✨', '🚀', '🌊', '📸'];

  useEffect(() => {
    if (drift) {
      setReactions(drift.reactions || []);
      setInteractions(drift.interactions || []);
    }
  }, [drift]);

  const handleEmojiSelect = async (emoji) => {
    setEmojiPickerVisible(false);
    try {
      await onReact(drift.id, emoji);
      // Update local state with the new reaction
      setReactions(prev => [...prev, { emoji, actor_id: currentUser.id, inserted_at: new Date().toISOString() }]);
    } catch (error) {
      console.error('Failed to react to drift:', error);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await onReply(drift.id, replyText);
      setReplyText('');
      // Refresh interactions to get the new reply
      const res = await api.driftApi.get(drift.id);
      setInteractions(res.data.interactions);
    } catch (error) {
      console.error('Failed to post reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(drift.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete drift:', error);
    }
  };

  const startEditing = () => {
    setEditText(drift.note || '');
    setIsEditing(true);
  };

  const saveEdit = async () => {
    if (!editText.trim()) return;
    setIsSubmitting(true);
    try {
      await onEdit(drift.id, editText.trim());
      const res = await api.driftApi.get(drift.id);
      setReactions(res.data.reactions || []);
      setInteractions(res.data.interactions || []);
    } catch (error) {
      console.error('Failed to edit drift:', error);
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditText('');
  };

  const isOwnDrift = drift?.user?.id === currentUser?.id;

  if (!drift) return null;


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <img
                  src={drift.user?.avatar_url || `https://ui-avatars.com/api/?name=${drift.user?.username}&background=6366F1&color=fff`}
                  alt={drift.user?.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {drift.user?.username || 'Anonymous'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(drift.inserted_at).toLocaleDateString()} at{' '}
                    {new Date(drift.inserted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Drift Content */}
              <div className="mb-6">

                {isEditing ? (
                  <div className="flex flex-col gap-3">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-base resize-none focus:ring-2 focus:ring-tide-500 outline-none"
                      rows={3}
                      autoFocus
                      disabled={isSubmitting}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        disabled={!editText.trim() || isSubmitting}
                        className="flex-1 px-4 py-2 bg-tide-600 text-white rounded-lg hover:bg-tide-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? <Loader size={16} className="animate-spin" /> : <X size={16} />}
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed whitespace-pre-wrap">
                      {drift.note}
                    </p>
                    {drift.song_name && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>🎵</span>
                        <span>{drift.song_name}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Reactions */}
              {reactions.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Heart size={16} className="text-red-500" />
                    Reactions ({reactions.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {reactions.map((reaction, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1"
                      >
                        <span className="text-sm">{reaction.emoji}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {reaction.actor_id === currentUser?.id ? 'You' : `User ${reaction.actor_id}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Replies */}
              {interactions.filter(i => i.type === 'reply').length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <MessageCircle size={16} className="text-blue-500" />
                    Replies ({interactions.filter(i => i.type === 'reply').length})
                  </h4>
                  <div className="space-y-3">
                    {interactions
                      .filter(i => i.type === 'reply')
                      .map((reply, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {reply.actor?.username || 'Anonymous'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(reply.inserted_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {reply.payload?.content}
                          </p>
                        </motion.div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {standardEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center text-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
                <button
                  onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Smile size={18} className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* Emoji Picker (simple version) */}
              {emojiPickerVisible && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="grid grid-cols-8 gap-1">
                    {['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆',
                      '😇', '😈', '😉', '😊', '😋', '😌', '😍', '😎',
                      '😏', '😐', '😑', '😒', '😓', '😔', '😕', '😖',
                      '😗', '😘', '😙', '😚', '😛', '😜', '😝', '😞',
                      '😟', '😠', '😡', '😢', '😣', '😤', '😥', '😦',
                      '😧', '😨', '😩', '😪', '😫', '😬', '😭', '😮',
                      '😯', '😰', '😱', '😲', '😳', '😴', '😵', '😶',
                      '😷', '😸', '😹', '😺', '😻', '😼', '😽', '😾',
                      '😿', '🙀', '🙁', '🙂', '🙃', '🙄', '🙅', '🙆',
                      '🙇', '🙈', '🙉', '🙊', '🙋', '🙌', '🙍', '🙎',
                      '🙏', '🙐', '🙑', '🙒', '🙓', '🙔', '🙕', '🙖',
                      '🙗', '🙘', '🙙', '🙚', '🙛', '🙜', '🙝', '🙞',
                      '🙟', '🙠', '🙡', '🙢', '🙣', '🙤', '🙥', '🙦',
                      '🙧', '🙨', '🙩', '🙪', '🙫', '🙬', '🙭', '🙮',
                      '🙯', '🙰', '🙱', '🙲', '🙳', '🙴', '🙵', '🙶',
                      '🙷', '🙸', '🙹', '🙺', '🙻', '🙼', '🙽', '🙾'
                    ].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="w-8 h-8 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center justify-center text-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Input / Own Drift Actions */}
              {isOwnDrift ? (
                <div className="flex gap-2">
                  <button
                    onClick={startEditing}
                    className="flex-1 px-4 py-2 bg-tide-600 text-white rounded-lg hover:bg-tide-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    Edit Drift
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete Drift
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReplySubmit} className="flex flex-col gap-2 justified-centre ">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Add a reply..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-tide-500 focus:border-transparent outline-none"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || isSubmitting}
                    className="px-4 py-2 w-fit  bg-tide-600 text-white rounded-lg hover:bg-tide-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Reply size={16} />
                        Reply
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DriftModal;
