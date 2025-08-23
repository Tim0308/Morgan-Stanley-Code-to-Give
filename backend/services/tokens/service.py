"""
Tokens service implementation
Business logic for token accounts, transactions, shop, and redemptions
"""

from typing import List, Dict, Any, Optional
import logging
from datetime import datetime, date, timedelta

from core.database import get_supabase_client

logger = logging.getLogger(__name__)


class TokensService:
    """Service for token management"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
    
    async def get_token_balance(self, child_id: str, user_id: str) -> Dict[str, Any]:
        """Get token balance for a child"""
        try:
            # Verify child belongs to user
            result = self.supabase.table("children").select("*").eq("id", child_id).eq("parent_user_id", user_id).execute()
            if not result.data:
                raise ValueError("Child not found or access denied")
            
            child = result.data[0]
            
            # Get token account info
            token_result = self.supabase.table("token_accounts").select("*").eq("child_id", child_id).execute()
            
            if not token_result.data:
                # Create token account if it doesn't exist
                self.supabase.table("token_accounts").insert({
                    "child_id": child_id,
                    "balance": 0,
                    "weekly_earned": 0,
                    "rank_percentile": 0.0
                }).execute()
                
                token_info = {
                    "balance": 0,
                    "weekly_earned": 0,
                    "rank_percentile": 0.0
                }
            else:
                token_info = token_result.data[0]
            
            # Get recent transactions
            transactions_result = self.supabase.table("token_transactions").select("*").eq("account_id", child_id).order("created_at", desc=True).limit(10).execute()
            
            transactions = []
            for trans in transactions_result.data:
                transactions.append({
                    "id": trans["id"],
                    "delta": trans["delta"],
                    "reason": trans["reason"],
                    "created_at": trans["created_at"],
                    "description": self._get_transaction_description(trans)
                })
            
            return {
                "child_id": child_id,
                "child_name": child.get("nickname", "Child"),
                "balance": token_info["balance"],
                "weekly_earned": token_info["weekly_earned"],
                "rank_percentile": float(token_info.get("rank_percentile", 0.0)),
                "recent_transactions": transactions
            }
            
        except Exception as e:
            logger.error(f"Failed to get token balance: {e}")
            raise
    
    async def get_shop_items(self) -> List[Dict[str, Any]]:
        """Get available shop items"""
        try:
            result = self.supabase.table("shop_items").select("*").eq("is_active", True).execute()
            
            items = []
            for item in result.data:
                items.append({
                    "id": item["id"],
                    "name": item["name"],
                    "category": item.get("category", "General"),
                    "price": item["price"],
                    "inventory_qty": item.get("inventory_qty"),
                    "is_available": item.get("inventory_qty", 0) > 0 if item.get("inventory_qty") is not None else True
                })
            
            return items
            
        except Exception as e:
            logger.error(f"Failed to get shop items: {e}")
            raise
    
    async def redeem_tokens(self, child_id: str, item_id: str, quantity: int, user_id: str) -> Dict[str, Any]:
        """Redeem tokens for a shop item"""
        try:
            # Verify child belongs to user
            child_result = self.supabase.table("children").select("*").eq("id", child_id).eq("parent_user_id", user_id).execute()
            if not child_result.data:
                raise ValueError("Child not found or access denied")
            
            # Get shop item
            item_result = self.supabase.table("shop_items").select("*").eq("id", item_id).eq("is_active", True).execute()
            if not item_result.data:
                raise ValueError("Shop item not found or not available")
            
            item = item_result.data[0]
            total_cost = item["price"] * quantity
            
            # Check inventory if applicable
            if item.get("inventory_qty") is not None and item["inventory_qty"] < quantity:
                raise ValueError("Insufficient inventory")
            
            # Get token balance
            token_result = self.supabase.table("token_accounts").select("*").eq("child_id", child_id).execute()
            if not token_result.data or token_result.data[0]["balance"] < total_cost:
                raise ValueError("Insufficient tokens")
            
            current_balance = token_result.data[0]["balance"]
            
            # Process redemption in a transaction-like manner
            # 1. Create redemption record
            redemption_result = self.supabase.table("redemptions").insert({
                "account_id": child_id,
                "item_id": item_id,
                "qty": quantity,
                "status": "requested"
            }).execute()
            
            # 2. Deduct tokens
            self.supabase.table("token_accounts").update({
                "balance": current_balance - total_cost
            }).eq("child_id", child_id).execute()
            
            # 3. Add transaction record
            self.supabase.table("token_transactions").insert({
                "account_id": child_id,
                "delta": -total_cost,
                "reason": "purchase",
                "ref_table": "redemptions",
                "ref_id": redemption_result.data[0]["id"],
                "actor_id": user_id
            }).execute()
            
            # 4. Update inventory if applicable
            if item.get("inventory_qty") is not None:
                self.supabase.table("shop_items").update({
                    "inventory_qty": item["inventory_qty"] - quantity
                }).eq("id", item_id).execute()
            
            return {
                "message": "Redemption successful",
                "redemption_id": redemption_result.data[0]["id"],
                "item_name": item["name"],
                "quantity": quantity,
                "cost": total_cost,
                "remaining_balance": current_balance - total_cost
            }
            
        except Exception as e:
            logger.error(f"Failed to redeem tokens: {e}")
            raise
    
    def _get_transaction_description(self, transaction: Dict[str, Any]) -> str:
        """Generate human-readable description for transaction"""
        reason = transaction["reason"]
        delta = transaction["delta"]
        
        if reason == "activity_complete":
            return f"Completed activity (+{delta} tokens)"
        elif reason == "weekly_goal":
            return f"Weekly goal achieved (+{delta} tokens)"
        elif reason == "helpful_answer":
            return f"Helpful answer (+{delta} tokens)"
        elif reason == "engagement_bonus":
            return f"Engagement bonus (+{delta} tokens)"
        elif reason == "purchase":
            return f"Shop purchase ({delta} tokens)"
        elif reason == "gift":
            return f"Gift received (+{delta} tokens)"
        else:
            return f"{reason.replace('_', ' ').title()} ({'+' if delta > 0 else ''}{delta} tokens)"
