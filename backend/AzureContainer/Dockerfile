# FROM debian:10 as code-server

# RUN apt-get update && \
#     apt-get install -y \
#       curl \
#       dumb-init \
#       htop \
#       locales \
#       man \
#       nano \
#       git \
#       procps \
#       openssh-client \
#       sudo \
#       vim.tiny \
#       lsb-release && \
#     rm -rf /var/lib/apt/lists/*

# # https://wiki.debian.org/Locale#Manually
# RUN sed -i "s/# en_US.UTF-8/en_US.UTF-8/" /etc/locale.gen && \
#     locale-gen

# ENV LANG=en_US.UTF-8

# RUN adduser --gecos '' --disabled-password coder && \
#   echo "coder ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/nopasswd

# RUN ARCH="$(dpkg --print-architecture)" && \
#     curl -fsSL "https://github.com/boxboat/fixuid/releases/download/v0.4.1/fixuid-0.4.1-linux-$ARCH.tar.gz" | tar -C /usr/local/bin -xzf - && \
#     chown root:root /usr/local/bin/fixuid && \
#     chmod 4755 /usr/local/bin/fixuid && \
#     mkdir -p /etc/fixuid && \
#     printf "user: coder\ngroup: coder\n" > /etc/fixuid/config.yml

# COPY release-packages/code-server*.deb /tmp/
# COPY ci/release-image/entrypoint.sh /usr/bin/entrypoint.sh
# RUN dpkg -i /tmp/code-server*$(dpkg --print-architecture).deb && rm /tmp/code-server*.deb

# EXPOSE 8080
# # This way, if someone sets $DOCKER_USER, docker-exec will still work as
# # the uid will remain the same. note: only relevant if -u isn't passed to
# # docker-run.
# USER 1000
# ENV USER=coder
# WORKDIR /home/coder

FROM codercom/code-server as onlythemes

WORKDIR /home/coder/onlythemes

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work as well as node and npm.
RUN sudo apt update && \
    sudo apt install -yyq wget gnupg && \
    sudo wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add - && \
    sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    sudo apt update && \
    sudo apt install -yyq google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei \
      fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      nodejs npm && \
    sudo rm -rf /var/lib/apt/lists/* && \
    sudo apt clean

COPY package*.json .
RUN npm install

COPY . .
RUN sudo mkdir -p ~/.config/code-server && \
    sudo mkdir -p ~/.local/share/code-server/User && \
    sudo mv ./config.yaml ~/.config/code-server/config.yaml && \
    sudo mv ./settings.json ~/.local/share/code-server/User/settings.json && \
    sudo chown -R $USER:$USER /home/coder/.config && \
    sudo chown -R $USER:$USER /home/coder/.local

RUN sudo rm /usr/bin/entrypoint.sh && \
    sudo ln -s ~/onlythemes/entrypoint.sh /usr/bin/entrypoint.sh

