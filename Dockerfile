ARG UBUNTU_VERSION=18.04

FROM ubuntu:${UBUNTU_VERSION} AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        git \
        libcurl3-dev \
        libfreetype6-dev \
        libhdf5-serial-dev \
        libzmq3-dev \
        pkg-config \
        rsync \
        software-properties-common \
	    sudo \
        unzip \
        zip \
        zlib1g-dev \
        cmake \
        libgtk-3-dev \
        libboost-all-dev \
        openjdk-8-jdk \
        openjdk-8-jre-headless \
        && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV CI_BUILD_PYTHON python

ARG USE_PYTHON_3_NOT_2=3.7
ARG _PY_SUFFIX=${USE_PYTHON_3_NOT_2:+3}
ARG PYTHON=python${_PY_SUFFIX}
ARG PIP=pip${_PY_SUFFIX}

# See http://bugs.python.org/issue19846
ENV LANG C.UTF-8

RUN apt-get update && apt-get install -y \
    ${PYTHON} \
    ${PYTHON}-pip

RUN ${PIP} --no-cache-dir install --upgrade \
    pip \
    setuptools

RUN ln -s $(which ${PYTHON}) /usr/local/bin/python 

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    wget \
    ${PYTHON}-dev \
    virtualenv \
    swig

RUN mkdir -p /mf/application && chmod -R a+rwx /mf/
WORKDIR /mf/application

COPY requirements.txt /mf/application/requirements.txt
COPY *.sh /mf/application/

RUN ${PIP} --no-cache-dir install \
    -r /mf/application/requirements.txt \
    && test "${USE_PYTHON_3_NOT_2}" -eq 1 && true || ${PIP} --no-cache-dir install \
    enum34

RUN mkdir /.local && chmod a+rwx /.local

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash

CMD ["bash", "/mf/application/run.sh"]

EXPOSE 8080
