from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=True)
    github_username = Column(String, nullable=True)
    github_access_token = Column(String, nullable=True)
    gitlab_username = Column(String, nullable=True)
    gitlab_access_token = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    repositories = relationship("Repository", back_populates="owner")
    sync_status = relationship("SyncStatus", back_populates="user", uselist=False)


class SyncStatus(Base):
    __tablename__ = "sync_status"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    is_syncing = Column(Boolean, default=False)
    last_synced_at = Column(DateTime, nullable=True)
    github_synced = Column(Boolean, default=False)
    gitlab_synced = Column(Boolean, default=False)
    error_message = Column(Text, nullable=True)

    user = relationship("User", back_populates="sync_status")


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    source = Column(String, nullable=False)
    language = Column(String, nullable=True)
    stars = Column(Integer, default=0)
    forks = Column(Integer, default=0)
    is_private = Column(Boolean, default=False)
    is_fork = Column(Boolean, default=False)
    last_activity = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="repositories")
    commits = relationship("Commit", back_populates="repository", cascade="all, delete-orphan")
    pull_requests = relationship("PullRequest", back_populates="repository", cascade="all, delete-orphan")
    issues = relationship("Issue", back_populates="repository", cascade="all, delete-orphan")
    languages = relationship("RepositoryLanguage", back_populates="repository", cascade="all, delete-orphan")


class RepositoryLanguage(Base):
    __tablename__ = "repository_languages"

    id = Column(Integer, primary_key=True, index=True)
    repo_id = Column(Integer, ForeignKey("repositories.id"))
    language = Column(String, nullable=False)
    percentage = Column(Integer, default=0)

    repository = relationship("Repository", back_populates="languages")


class Commit(Base):
    __tablename__ = "commits"

    id = Column(Integer, primary_key=True, index=True)
    repo_id = Column(Integer, ForeignKey("repositories.id"))
    sha = Column(String, nullable=True)
    message = Column(Text, nullable=False)
    committed_at = Column(DateTime, nullable=False)
    author = Column(String, nullable=True)
    additions = Column(Integer, default=0)
    deletions = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    repository = relationship("Repository", back_populates="commits")


class PullRequest(Base):
    __tablename__ = "pull_requests"

    id = Column(Integer, primary_key=True, index=True)
    repo_id = Column(Integer, ForeignKey("repositories.id"))
    title = Column(String, nullable=False)
    state = Column(String, nullable=False)        # "open" or "merged"
    opened_at = Column(DateTime, nullable=True)
    merged_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    repository = relationship("Repository", back_populates="pull_requests")


class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    repo_id = Column(Integer, ForeignKey("repositories.id"))
    title = Column(String, nullable=False)
    state = Column(String, nullable=False)        # "open" or "closed"
    opened_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    repository = relationship("Repository", back_populates="issues")
