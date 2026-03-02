'use client';

import { X } from 'lucide-react';

interface ConfirmationModalsProps {
  showNicknameModal: boolean;
  setShowNicknameModal: (show: boolean) => void;
  nicknameInput: string;
  setNicknameInput: (value: string) => void;
  selectedMatchName: string;
  handleSetNickname: () => void;
  
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  handleDeleteConversation: () => void;
  
  showBlockConfirm: boolean;
  setShowBlockConfirm: (show: boolean) => void;
  handleBlockUser: () => void;
  
  showUnmatchConfirm: boolean;
  setShowUnmatchConfirm: (show: boolean) => void;
  handleUnmatchUser: () => void;
  
  messageToDelete: string | null;
  setMessageToDelete: (id: string | null) => void;
  handleDeleteMessage: (id: string) => void;
}

export default function ConfirmationModals({
  showNicknameModal,
  setShowNicknameModal,
  nicknameInput,
  setNicknameInput,
  selectedMatchName,
  handleSetNickname,
  showDeleteConfirm,
  setShowDeleteConfirm,
  handleDeleteConversation,
  showBlockConfirm,
  setShowBlockConfirm,
  handleBlockUser,
  showUnmatchConfirm,
  setShowUnmatchConfirm,
  handleUnmatchUser,
  messageToDelete,
  setMessageToDelete,
  handleDeleteMessage
}: ConfirmationModalsProps) {
  return (
    <>
      {/* Nickname Modal */}
      {showNicknameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-6 max-w-md w-full mx-4 animate-fadeIn">
            <h3 className="text-xl font-bold text-[#0d1c17] dark:text-white mb-4">
              Set Nickname
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Set a custom nickname for {selectedMatchName}
            </p>
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="Enter nickname"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a2c26] border border-slate-200 dark:border-slate-700 rounded-xl text-[#0d1c17] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059467]/30 mb-6"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowNicknameModal(false);
                  setNicknameInput('');
                }}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSetNickname}
                className="px-4 py-2 bg-[#059467] hover:bg-[#047854] text-white rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Conversation Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-6 max-w-md w-full mx-4 animate-fadeIn">
            <h3 className="text-xl font-bold text-[#0d1c17] dark:text-white mb-4">
              Delete Conversation
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to delete this conversation with {selectedMatchName}? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConversation}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block User Confirmation */}
      {showBlockConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-6 max-w-md w-full mx-4 animate-fadeIn">
            <h3 className="text-xl font-bold text-[#0d1c17] dark:text-white mb-4">
              Block User
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to block {selectedMatchName}? They will no longer be able to message you.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unmatch Confirmation */}
      {showUnmatchConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-6 max-w-md w-full mx-4 animate-fadeIn">
            <h3 className="text-xl font-bold text-[#0d1c17] dark:text-white mb-4">
              Unmatch User
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to unmatch with {selectedMatchName}? This will delete all messages and remove the match. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowUnmatchConfirm(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUnmatchUser}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Unmatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Message Confirmation */}
      {messageToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-6 max-w-md w-full mx-4 animate-fadeIn">
            <h3 className="text-xl font-bold text-[#0d1c17] dark:text-white mb-4">
              Delete Message
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setMessageToDelete(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMessage(messageToDelete)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
