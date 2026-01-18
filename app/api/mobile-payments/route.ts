/**
 * API Paiements Mobile Money
 * Intégration Airtel Money, M-Pesa, Orange Money
 */

import { NextRequest, NextResponse } from 'next/server'
import { query, getClient } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { hasPermission } from '@/lib/auth/permissions'

// Configuration des providers (à personnaliser selon les APIs réelles)
const MOBILE_PROVIDERS = {
  AIRTEL_MONEY: {
    name: 'Airtel Money',
    prefix: ['099', '097'],
    apiUrl: process.env.AIRTEL_MONEY_API_URL,
    apiKey: process.env.AIRTEL_MONEY_API_KEY
  },
  MPESA: {
    name: 'M-Pesa',
    prefix: ['081', '082'],
    apiUrl: process.env.MPESA_API_URL,
    apiKey: process.env.MPESA_API_KEY
  },
  ORANGE_MONEY: {
    name: 'Orange Money',
    prefix: ['084', '085'],
    apiUrl: process.env.ORANGE_MONEY_API_URL,
    apiKey: process.env.ORANGE_MONEY_API_KEY
  },
  AFRIMONEY: {
    name: 'Afrimoney',
    prefix: ['090'],
    apiUrl: process.env.AFRIMONEY_API_URL,
    apiKey: process.env.AFRIMONEY_API_KEY
  }
}

// GET - Comptes et transactions
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    const userId = decoded.userId

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const transactionId = searchParams.get('transactionId')
    
    if (action === 'accounts') {
      // Liste des comptes de l'utilisateur
      const result = await query(`
        SELECT * FROM mobile_money_accounts
        WHERE user_id = $1
        ORDER BY is_default DESC, created_at DESC
      `, [userId])
      
      return NextResponse.json({ accounts: result.rows })
    }
    
    if (action === 'transactions') {
      // Historique des transactions
      const studentId = searchParams.get('studentId')
      const status = searchParams.get('status')
      const provider = searchParams.get('provider')
      
      let queryStr = `
        SELECT 
          mmt.*,
          p.student_id,
          s.matricule,
          u.first_name,
          u.last_name
        FROM mobile_money_transactions mmt
        LEFT JOIN payments p ON mmt.payment_id = p.id
        LEFT JOIN students s ON p.student_id = s.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE 1=1
      `
      const params: any[] = []
      let paramIndex = 1
      
      // Filtrer par étudiant ou compte
      if (studentId) {
        queryStr += ` AND p.student_id = $${paramIndex}`
        params.push(parseInt(studentId))
        paramIndex++
      } else {
        // Transactions de l'utilisateur connecté (via ses comptes)
        const canViewAll = await hasPermission(userId, 'VIEW_PAYMENTS')
        if (!canViewAll) {
          queryStr += ` AND mmt.account_id IN (
            SELECT id FROM mobile_money_accounts WHERE user_id = $${paramIndex}
          )`
          params.push(userId)
          paramIndex++
        }
      }
      
      if (status) {
        queryStr += ` AND mmt.status = $${paramIndex}`
        params.push(status)
        paramIndex++
      }
      
      if (provider) {
        queryStr += ` AND mmt.provider = $${paramIndex}`
        params.push(provider)
        paramIndex++
      }
      
      queryStr += ` ORDER BY mmt.initiated_at DESC LIMIT 100`
      
      const result = await query(queryStr, params)
      
      return NextResponse.json({ transactions: result.rows })
    }
    
    if (transactionId) {
      // Détail d'une transaction
      const result = await query(`
        SELECT 
          mmt.*,
          p.amount as payment_amount,
          p.payment_type,
          s.matricule,
          u.first_name,
          u.last_name
        FROM mobile_money_transactions mmt
        LEFT JOIN payments p ON mmt.payment_id = p.id
        LEFT JOIN students s ON p.student_id = s.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE mmt.id = $1
      `, [transactionId])
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Transaction non trouvée' }, { status: 404 })
      }
      
      return NextResponse.json({ transaction: result.rows[0] })
    }
    
    // Liste des providers disponibles
    return NextResponse.json({ 
      providers: Object.entries(MOBILE_PROVIDERS).map(([code, info]) => ({
        code,
        name: info.name,
        prefixes: info.prefix
      }))
    })
  } catch (error) {
    console.error('Erreur API mobile money:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Initier un paiement ou enregistrer un compte
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    const userId = decoded.userId
    
    const body = await request.json()
    const { action } = body
    
    if (action === 'register_account') {
      // Enregistrer un nouveau compte mobile money
      const { provider, phoneNumber, accountName, isDefault } = body
      
      if (!provider || !phoneNumber) {
        return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
      }
      
      // Valider le provider
      if (!MOBILE_PROVIDERS[provider as keyof typeof MOBILE_PROVIDERS]) {
        return NextResponse.json({ error: 'Provider non supporté' }, { status: 400 })
      }
      
      // Normaliser le numéro
      const normalizedPhone = phoneNumber.replace(/\D/g, '').slice(-9)
      
      const client = await getClient()
      
      try {
        await client.query('BEGIN')
        
        // Si c'est le compte par défaut, désactiver les autres
        if (isDefault) {
          await client.query(`
            UPDATE mobile_money_accounts 
            SET is_default = FALSE 
            WHERE user_id = $1
          `, [userId])
        }
        
        const result = await client.query(`
          INSERT INTO mobile_money_accounts (user_id, provider, phone_number, account_name, is_default)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (user_id, provider, phone_number) DO UPDATE SET
            account_name = EXCLUDED.account_name,
            is_default = EXCLUDED.is_default
          RETURNING *
        `, [userId, provider, normalizedPhone, accountName, isDefault || false])
        
        await client.query('COMMIT')
        
        return NextResponse.json({ 
          success: true, 
          account: result.rows[0],
          message: 'Compte enregistré avec succès' 
        })
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    }
    
    if (action === 'initiate_payment') {
      // Initier un paiement mobile money
      const { 
        studentId, 
        amount, 
        currency,
        paymentType, 
        phoneNumber,
        provider,
        academicYearId 
      } = body
      
      if (!studentId || !amount || !phoneNumber || !provider || !paymentType) {
        return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
      }
      
      const client = await getClient()
      
      try {
        await client.query('BEGIN')
        
        // Créer l'enregistrement de paiement
        const paymentResult = await client.query(`
          INSERT INTO payments (
            student_id, academic_year_id, amount, payment_type,
            payment_method, status, recorded_by
          ) VALUES ($1, $2, $3, $4, 'MOBILE_MONEY', 'PENDING', $5)
          RETURNING id
        `, [studentId, academicYearId, amount, paymentType, userId])
        
        const paymentId = paymentResult.rows[0].id
        
        // Générer une référence unique
        const reference = `NEX-${Date.now().toString(36).toUpperCase()}-${paymentId}`
        
        // Créer la transaction mobile money
        const transactionResult = await client.query(`
          INSERT INTO mobile_money_transactions (
            payment_id, provider, phone_number, amount, currency,
            reference, status
          ) VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
          RETURNING *
        `, [paymentId, provider, phoneNumber, amount, currency || 'CDF', reference])
        
        await client.query('COMMIT')
        
        // Ici, on devrait appeler l'API du provider
        // Pour l'instant, on simule l'initiation
        const transaction = transactionResult.rows[0]
        
        // Simuler l'appel API (à remplacer par l'appel réel)
        const providerResponse = await simulateProviderAPI(provider, {
          phoneNumber,
          amount,
          reference,
          currency: currency || 'CDF'
        })
        
        // Mettre à jour avec la réponse du provider
        await query(`
          UPDATE mobile_money_transactions
          SET 
            transaction_id = $2,
            status = $3,
            provider_response = $4,
            provider_message = $5
          WHERE id = $1
        `, [
          transaction.id,
          providerResponse.transactionId,
          providerResponse.status,
          JSON.stringify(providerResponse),
          providerResponse.message
        ])
        
        return NextResponse.json({ 
          success: true, 
          transaction: {
            ...transaction,
            ...providerResponse
          },
          message: providerResponse.message || 'Paiement initié. Vérifiez votre téléphone.' 
        })
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    }
    
    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
  } catch (error) {
    console.error('Erreur paiement mobile:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Webhook de confirmation ou mise à jour manuelle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    if (action === 'webhook') {
      // Webhook du provider (validation de paiement)
      const { reference, transactionId, status, providerData } = body
      
      if (!reference || !status) {
        return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
      }
      
      const client = await getClient()
      
      try {
        await client.query('BEGIN')
        
        // Mettre à jour la transaction
        const txResult = await client.query(`
          UPDATE mobile_money_transactions
          SET 
            status = $2,
            transaction_id = COALESCE($3, transaction_id),
            webhook_received = TRUE,
            webhook_data = $4,
            completed_at = CASE WHEN $2 = 'SUCCESS' THEN NOW() ELSE completed_at END
          WHERE reference = $1
          RETURNING *
        `, [reference, status, transactionId, JSON.stringify(providerData)])
        
        if (txResult.rows.length === 0) {
          await client.query('ROLLBACK')
          return NextResponse.json({ error: 'Transaction non trouvée' }, { status: 404 })
        }
        
        const transaction = txResult.rows[0]
        
        // Si le paiement est confirmé, mettre à jour le paiement principal
        if (status === 'SUCCESS' && transaction.payment_id) {
          await client.query(`
            UPDATE payments
            SET status = 'COMPLETED', payment_date = NOW()
            WHERE id = $1
          `, [transaction.payment_id])
          
          // Mettre à jour le statut de paiement de l'étudiant
          await client.query(`
            UPDATE students s
            SET payment_status = (
              SELECT CASE 
                WHEN SUM(p.amount) >= (
                  SELECT COALESCE(SUM(fee_amount), 0) 
                  FROM promotion_fees 
                  WHERE promotion_id = s.promotion_id
                ) THEN 'PAID'
                WHEN SUM(p.amount) > 0 THEN 'PARTIAL'
                ELSE 'UNPAID'
              END
              FROM payments p
              WHERE p.student_id = s.id AND p.status = 'COMPLETED'
            )
            FROM payments p
            WHERE p.id = $1 AND s.id = p.student_id
          `, [transaction.payment_id])
          
          // Notifier l'étudiant
          await client.query(`
            INSERT INTO notifications (user_id, title, message, type, link)
            SELECT 
              s.user_id,
              'Paiement confirmé',
              'Votre paiement de ' || $2 || ' ' || $3 || ' a été confirmé.',
              'SUCCESS',
              '/student/finances'
            FROM students s
            JOIN payments p ON s.id = p.student_id
            WHERE p.id = $1
          `, [transaction.payment_id, transaction.amount, transaction.currency])
        }
        
        await client.query('COMMIT')
        
        return NextResponse.json({ 
          success: true, 
          message: 'Transaction mise à jour' 
        })
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    }
    
    // Confirmation manuelle (admin)
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    const userId = decoded.userId
    
    const canRecord = await hasPermission(userId, 'RECORD_PAYMENTS')
    if (!canRecord) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }
    
    const { transactionId, status, notes } = body
    
    if (!transactionId || !status) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }
    
    await query(`
      UPDATE mobile_money_transactions
      SET status = $2, provider_message = $3, completed_at = NOW()
      WHERE id = $1
    `, [transactionId, status, notes])
    
    return NextResponse.json({ success: true, message: 'Transaction mise à jour' })
  } catch (error) {
    console.error('Erreur mise à jour paiement:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Simulation de l'API du provider (à remplacer par les vraies implémentations)
async function simulateProviderAPI(provider: string, data: {
  phoneNumber: string
  amount: number
  reference: string
  currency: string
}): Promise<{
  transactionId: string
  status: string
  message: string
}> {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // En production, ici on ferait l'appel à l'API réelle du provider
  // Exemple pour Airtel Money:
  // const response = await fetch(MOBILE_PROVIDERS.AIRTEL_MONEY.apiUrl + '/payment', {
  //   method: 'POST',
  //   headers: { 'Authorization': `Bearer ${MOBILE_PROVIDERS.AIRTEL_MONEY.apiKey}` },
  //   body: JSON.stringify({...})
  // })
  
  return {
    transactionId: `SIM-${Date.now().toString(36)}`,
    status: 'PROCESSING',
    message: `Veuillez confirmer le paiement de ${data.amount} ${data.currency} sur votre téléphone ${data.phoneNumber}`
  }
}
