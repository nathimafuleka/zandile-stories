'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, CheckCircle, Upload, FileText, Trash2 } from 'lucide-react'
import { useState, useRef } from 'react'

interface BankTransferModalProps {
  isOpen: boolean
  onClose: () => void
  chapterTitle: string
  amount: number
  bankingDetails: {
    bankName: string
    accountHolder: string
    accountNumber: string
    branchCode: string
    accountType: string
  }
  onSubmit: (proofFile: File | null) => void
}

export default function BankTransferModal({
  isOpen,
  onClose,
  chapterTitle,
  amount,
  bankingDetails,
  onSubmit
}: BankTransferModalProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setFileError('')
    
    if (file) {
      // Validate file type (PDF, JPG, PNG)
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!validTypes.includes(file.type)) {
        setFileError('Please upload a PDF, JPG, or PNG file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFileError('File size must be less than 5MB')
        return
      }
      
      setProofFile(file)
    }
  }

  const removeFile = () => {
    setProofFile(null)
    setFileError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = () => {
    onSubmit(proofFile)
    setProofFile(null)
    setFileError('')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Bank Transfer Payment</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Chapter:</strong> {chapterTitle}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <strong>Amount:</strong> R {amount}
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Banking Details</h4>
              <div className="space-y-3">
                {bankingDetails.bankName && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500">Bank Name</p>
                      <p className="font-semibold text-gray-900">{bankingDetails.bankName}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankingDetails.bankName, 'bank')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {copied === 'bank' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                )}

                {bankingDetails.accountHolder && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500">Account Holder</p>
                      <p className="font-semibold text-gray-900">{bankingDetails.accountHolder}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankingDetails.accountHolder, 'holder')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {copied === 'holder' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                )}

                {bankingDetails.accountNumber && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500">Account Number</p>
                      <p className="font-semibold text-gray-900">{bankingDetails.accountNumber}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankingDetails.accountNumber, 'account')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {copied === 'account' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                )}

                {bankingDetails.branchCode && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500">Branch Code</p>
                      <p className="font-semibold text-gray-900">{bankingDetails.branchCode}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankingDetails.branchCode, 'branch')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {copied === 'branch' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                )}

                {bankingDetails.accountType && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500">Account Type</p>
                      <p className="font-semibold text-gray-900">{bankingDetails.accountType}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-semibold mb-2">Instructions:</p>
              <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                <li>Make the payment using the banking details above</li>
                <li>Use your name or email as the payment reference</li>
                <li>Upload your proof of payment (PDF, JPG, or PNG)</li>
                <li>Admin will verify and unlock your chapter</li>
              </ol>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proof of Payment (POP) <span className="text-red-500">*</span>
              </label>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
              
              {!proofFile ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors flex items-center justify-center gap-2 text-gray-600"
                >
                  <Upload className="w-5 h-5" />
                  <span>Click to upload POP (PDF, JPG, PNG)</span>
                </button>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <FileText className="w-8 h-8 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {proofFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(proofFile.size)}
                    </p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              {fileError && (
                <p className="text-xs text-red-500 mt-2">{fileError}</p>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                Upload a screenshot, photo, or PDF of your payment receipt. Max 5MB.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!proofFile}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Payment
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
