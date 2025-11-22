use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod zwap {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.bump = ctx.bumps.vault;
        msg!("ZWAP program initialized");
        Ok(())
    }

    pub fn deposit_sol(
        ctx: Context<DepositSol>,
        amount: u64,
        deposit_id: String,
        z_address: String,
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(
            z_address.starts_with("z") || z_address.starts_with("u1"),
            ErrorCode::InvalidZAddress
        );

        // Transfer SOL to vault
        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.vault.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.vault.to_account_info(),
            ],
        )?;

        // Emit deposit event
        emit!(DepositEvent {
            user_pubkey: ctx.accounts.user.key(),
            asset: "SOL".to_string(),
            amount,
            z_address,
            deposit_id,
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!("SOL deposit successful: {} lamports", amount);
        Ok(())
    }

    pub fn deposit_usdc(
        ctx: Context<DepositUsdc>,
        amount: u64,
        deposit_id: String,
        z_address: String,
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(
            z_address.starts_with("z") || z_address.starts_with("u1"),
            ErrorCode::InvalidZAddress
        );

        // Transfer USDC tokens to vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        // Emit deposit event
        emit!(DepositEvent {
            user_pubkey: ctx.accounts.user.key(),
            asset: "USDC".to_string(),
            amount,
            z_address,
            deposit_id,
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!("USDC deposit successful: {} tokens", amount);
        Ok(())
    }

    pub fn admin_withdraw_sol(
        ctx: Context<AdminWithdraw>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        let vault = &ctx.accounts.vault;
        let vault_lamports = vault.to_account_info().lamports();
        
        require!(
            vault_lamports >= amount,
            ErrorCode::InsufficientFunds
        );

        // Transfer SOL from vault to authority
        **vault.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.authority.to_account_info().try_borrow_mut_lamports()? += amount;

        msg!("Admin withdrew {} lamports from vault", amount);
        Ok(())
    }

    pub fn admin_withdraw_usdc(
        ctx: Context<AdminWithdrawToken>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        let vault = &ctx.accounts.vault;
        let seeds = &[b"vault".as_ref(), &[vault.bump]];
        let signer = &[&seeds[..]];

        // Transfer USDC from vault to authority
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.authority_token_account.to_account_info(),
            authority: vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, amount)?;

        msg!("Admin withdrew {} USDC tokens from vault", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositSol<'info> {
    #[account(
        mut,
        seeds = [b"vault"],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositUsdc<'info> {
    #[account(
        mut,
        seeds = [b"vault"],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct AdminWithdraw<'info> {
    #[account(
        mut,
        seeds = [b"vault"],
        bump = vault.bump,
        has_one = authority
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AdminWithdrawToken<'info> {
    #[account(
        mut,
        seeds = [b"vault"],
        bump = vault.bump,
        has_one = authority
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub authority_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub authority: Pubkey,
    pub bump: u8,
}

#[event]
pub struct DepositEvent {
    pub user_pubkey: Pubkey,
    pub asset: String,
    pub amount: u64,
    pub z_address: String,
    pub deposit_id: String,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid amount: must be greater than 0")]
    InvalidAmount,
    #[msg("Invalid Zcash address: must start with 'z' or 'u1'")]
    InvalidZAddress,
    #[msg("Insufficient funds in vault")]
    InsufficientFunds,
}
