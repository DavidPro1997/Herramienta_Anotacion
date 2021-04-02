"""columna_coeficiente_en_politica

Revision ID: 335c66500caa
Revises: 5ecc97a84fcd
Create Date: 2020-04-23 19:32:55.999138

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '335c66500caa'
down_revision = '5ecc97a84fcd'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('politica', sa.Column('coeficiente', sa.Float(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('politica', 'coeficiente')
    # ### end Alembic commands ###
